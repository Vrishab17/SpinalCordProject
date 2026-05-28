export type StaffInfo = {
    username: string;
    fullName: string;
    staffId: number;
  };
  
  export function getLoggedInStaff(): StaffInfo | null {
    if (typeof window === "undefined") return null;
  
    try {
      const staffInfo = sessionStorage.getItem("staffInfo");
      if (!staffInfo) return null;
  
      return JSON.parse(staffInfo) as StaffInfo;
    } catch {
      return null;
    }
  }
  
  export async function logoutStaff() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("staffInfo");
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network errors during logout
    }
  }

  export function isStaffLoggedIn(): boolean {
    return getLoggedInStaff() != null;
  }
