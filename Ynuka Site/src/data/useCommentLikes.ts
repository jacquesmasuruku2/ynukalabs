import { useState } from 'react';
import { fetchFromApi, LikeResponse } from '@/lib/api';

interface UseCommentLikesProps {
  commentId: string;
  userEmail: string | null;
  onLikeUpdate?: (likes: number, userLiked: boolean) => void;
  onAuthRequired?: () => void;
}

export const useCommentLikes = ({ commentId, userEmail, onLikeUpdate, onAuthRequired }: UseCommentLikesProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = async (currentLiked: boolean) => {
    if (!userEmail) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return { success: false, message: 'Connectez-vous pour liker' };
    }

    setIsLoading(true);
    try {
      const result = await fetchFromApi<LikeResponse>(
        currentLiked ? 'decrement' : 'increment',
        {
          resource: 'blog_comment_likes',
          comment_id: commentId,
          user_email: userEmail
        }
      );

      if (result.success && onLikeUpdate) {
        onLikeUpdate(result.likes || 0, !currentLiked);
      }

      return result;
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, message: 'Erreur lors du like' };
    } finally {
      setIsLoading(false);
    }
  };

  return { toggleLike, isLoading };
};