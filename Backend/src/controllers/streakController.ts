import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getStreaks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('streaks')
      .select('*, habits(title, color)')
      .eq('user_id', userId)
      .order('current_streak', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ streaks: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};