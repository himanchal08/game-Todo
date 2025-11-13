import { Request, Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: undefined, // Disable email confirmation for development
      },
    });

    if (error) {
      console.error("Supabase signup error:", error);
      return res.status(400).json({ error: error.message });
    }

    // Create profile (only if user was created)
    if (data.user && data.user.id) {
      // Use admin client to bypass RLS
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: data.user.id,
          full_name: fullName || email.split("@")[0],
          username: email.split("@")[0],
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't fail signup if profile creation fails
      }
    }

    res.status(201).json({
      message:
        "User created successfully. Please check your email to confirm your account.",
      user: data.user,
      session: data.session,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "Login successful",
      user: data.user,
      session: data.session,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Logout successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Use admin client to bypass RLS
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      // If profile not found, create it automatically
      if (error.code === "PGRST116") {
        console.log(`Profile not found for user ${user.id}, creating...`);

        const { data: newProfile, error: createError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: user.id,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User",
            username: user.email?.split("@")[0] || "user",
          })
          .select()
          .single();

        if (createError) {
          console.error("Auto profile creation error:", createError);
          return res.status(500).json({ error: "Failed to create profile" });
        }

        return res.json({ profile: newProfile });
      }

      console.error("Profile fetch error:", error);
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Use admin client to bypass RLS
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        ...req.body,
      })
      .select()
      .single();

    if (error) {
      console.error("Profile creation error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ profile });
  } catch (error: any) {
    console.error("Profile creation error:", error);
    res.status(500).json({ error: error.message });
  }
};
