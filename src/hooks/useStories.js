import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useFriends } from './useFriends';

export const useStories = () => {
  const [stories, setStories] = useState([]);
  const [friendsStories, setFriendsStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { friends } = useFriends();

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user, friends]);

  const fetchStories = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch current user's own stories
      const { data: myStories, error: myStoriesError } = await supabase
        .from('stories')
        .select(`
          id,
          media_url,
          media_type,
          caption,
          created_at,
          expires_at,
          views
        `)
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (myStoriesError) throw myStoriesError;

      // Fetch friends' stories
      const friendIds = (friends || []).map(friend => friend.id);
      let allFriendsStories = [];
      
      if (friendIds.length > 0) {
        const { data: friendsStoriesData, error: friendsStoriesError } = await supabase
          .from('stories')
          .select(`
            id,
            user_id,
            media_url,
            media_type,
            caption,
            created_at,
            expires_at,
            views
          `)
          .in('user_id', friendIds)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (friendsStoriesError) throw friendsStoriesError;
        
        // Add user data to each story from the friends array
        allFriendsStories = (friendsStoriesData || []).map(story => {
          const storyUser = friends.find(friend => friend.id === story.user_id);
          return {
            ...story,
            users: storyUser || {
              display_name: 'Unknown User',
              username: 'unknown',
              photo_url: null
            }
          };
        });
      }

      // Group friends' stories by user
      const groupedFriendsStories = {};
      allFriendsStories.forEach(story => {
        if (!groupedFriendsStories[story.user_id]) {
          groupedFriendsStories[story.user_id] = {
            user: story.users,
            stories: []
          };
        }
        groupedFriendsStories[story.user_id].stories.push(story);
      });

      // Create stories list for UI
      const storiesList = [
        {
          id: 'my-story',
          user: 'My Story',
          isOwnStory: true,
          hasStory: myStories && myStories.length > 0,
          stories: myStories || [],
          avatar: user.photo_url,
        },
        ...Object.keys(groupedFriendsStories).map(userId => ({
          id: userId,
          user: groupedFriendsStories[userId].user.display_name || groupedFriendsStories[userId].user.username,
          isOwnStory: false,
          hasStory: true,
          stories: groupedFriendsStories[userId].stories,
          avatar: groupedFriendsStories[userId].user.photo_url,
        }))
      ];

      setStories(storiesList);
      setFriendsStories(allFriendsStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (mediaUrl, mediaType = 'image', caption = '') => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([
          {
            user_id: user.id,
            media_url: mediaUrl,
            media_type: mediaType,
            caption: caption
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Refresh stories after creating
      await fetchStories();
      
      return data;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  };

  const markStoryAsViewed = async (storyId) => {
    if (!user) return;

    try {
      // First get the current story to check views
      const { data: story, error: fetchError } = await supabase
        .from('stories')
        .select('views')
        .eq('id', storyId)
        .single();

      if (fetchError) throw fetchError;

      const currentViews = story.views || [];
      
      // Only add view if user hasn't viewed it already
      if (!currentViews.includes(user.id)) {
        const { error } = await supabase
          .from('stories')
          .update({
            views: [...currentViews, user.id]
          })
          .eq('id', storyId);

        if (error) throw error;

        // Refresh stories to update view counts
        await fetchStories();
      }
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const deleteStory = async (storyId) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id); // Ensure only owner can delete

      if (error) throw error;

      // Refresh stories after deleting
      await fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  };

  return {
    stories,
    friendsStories,
    loading,
    fetchStories,
    createStory,
    markStoryAsViewed,
    deleteStory,
  };
}; 