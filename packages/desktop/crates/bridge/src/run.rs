//! Run blocking bridge calls off the GPUI UI thread.

use gpui::{AsyncApp, BackgroundExecutor, Context, Task, WeakEntity};

use crate::error::BridgeError;

/// Execute `work` on a background thread, then apply the result on the entity.
///
/// ```ignore
/// celestia_bridge::run(cx, {
///     let client = self.bridge.clone();
///     move || client.health()
/// }, |this, result, cx| {
///     this.health = Some(result);
///     cx.notify();
/// });
/// ```
pub fn run<V, T, F, A>(cx: &Context<V>, work: F, apply: A) -> Task<()>
where
    V: 'static,
    T: Send + 'static,
    F: FnOnce() -> Result<T, BridgeError> + Send + 'static,
    A: FnOnce(&mut V, Result<T, BridgeError>, &mut Context<V>) + 'static,
{
    let executor = cx.background_executor().clone();
    cx.spawn(async move |entity: WeakEntity<V>, cx: &mut AsyncApp| {
        let result = spawn_blocking(&executor, work).await;
        entity
            .update(cx, |this, cx| {
                apply(this, result, cx);
            })
            .ok();
    })
}

async fn spawn_blocking<T, F>(executor: &BackgroundExecutor, work: F) -> Result<T, BridgeError>
where
    T: Send + 'static,
    F: FnOnce() -> Result<T, BridgeError> + Send + 'static,
{
    // `std::thread` keeps ureq's blocking I/O off the smol worker pool.
    let (tx, rx) = oneshot();
    std::thread::Builder::new()
        .name("celestia-bridge".into())
        .spawn(move || {
            let _ = tx.send(work());
        })
        .map_err(|e| BridgeError::Transport(e.to_string()))?;

    // Poll the oneshot on the background executor without blocking UI.
    loop {
        if let Ok(result) = rx.try_recv() {
            return result;
        }
        executor.timer(std::time::Duration::from_millis(8)).await;
    }
}

fn oneshot<T: Send + 'static>() -> (std::sync::mpsc::Sender<T>, std::sync::mpsc::Receiver<T>) {
    std::sync::mpsc::channel()
}
