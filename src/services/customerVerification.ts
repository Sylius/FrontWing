const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

export const sendVerificationEmail = async (
  email: string,
  link: string,
  jwtToken: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/v2/shop/customers/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ email, link }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || errorData.detail || "Failed to send verification email.",
      };
    }
  } catch {
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
};

export const verifyToken = async (
  token: string,
  jwtToken: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/v2/shop/customers/verify/${token}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || errorData.detail || "Verification failed.",
      };
    }
  } catch {
    return {
      success: false,
      message: "Unexpected error during token verification. Please try again.",
    };
  }
};
