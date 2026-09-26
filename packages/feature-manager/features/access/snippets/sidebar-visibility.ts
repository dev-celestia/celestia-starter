          if ("adminOnly" in item && item.adminOnly && user.role !== "admin") return null
