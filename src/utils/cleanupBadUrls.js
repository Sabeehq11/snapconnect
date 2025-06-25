import { supabase } from '../../lib/supabase';

export const findMessagesWithBadUrls = async () => {
  try {
    console.log('🔍 Searching for messages with local file URLs...');
    
    // Find all image messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, media_url, content, created_at, sender_id, chat_id')
      .eq('message_type', 'image')
      .not('media_url', 'is', null);

    if (error) {
      console.error('❌ Error fetching messages:', error);
      return { error: error.message };
    }

    // Filter messages with local file URLs
    const badMessages = messages.filter(msg => 
      msg.media_url && msg.media_url.startsWith('file://')
    );

    const goodMessages = messages.filter(msg => 
      msg.media_url && msg.media_url.startsWith('https://')
    );

    console.log(`📊 Found ${messages.length} total image messages:`);
    console.log(`❌ ${badMessages.length} with local file URLs (need fixing)`);
    console.log(`✅ ${goodMessages.length} with proper HTTPS URLs`);

    if (badMessages.length > 0) {
      console.log('\n🔍 Sample bad URLs:');
      badMessages.slice(0, 3).forEach((msg, index) => {
        console.log(`${index + 1}. Message ${msg.id}: ${msg.media_url.substring(0, 80)}...`);
      });
    }

    return {
      total: messages.length,
      bad: badMessages.length,
      good: goodMessages.length,
      badMessages: badMessages,
      goodMessages: goodMessages
    };

  } catch (error) {
    console.error('❌ Error in findMessagesWithBadUrls:', error);
    return { error: error.message };
  }
};

export const markBadMessagesAsUnavailable = async () => {
  try {
    console.log('🔧 Marking messages with bad URLs as unavailable...');
    
    // Update messages with local file URLs to have a special marker
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        media_url: null,
        content: 'Image unavailable (upload failed)'
      })
      .like('media_url', 'file://%')
      .select();

    if (error) {
      console.error('❌ Error updating messages:', error);
      return { error: error.message };
    }

    console.log(`✅ Updated ${data.length} messages with bad URLs`);
    return { updated: data.length };

  } catch (error) {
    console.error('❌ Error in markBadMessagesAsUnavailable:', error);
    return { error: error.message };
  }
};

export const findStoriesWithBadUrls = async () => {
  try {
    console.log('🔍 Searching for stories with local file URLs...');
    
    // Find all stories
    const { data: stories, error } = await supabase
      .from('stories')
      .select('id, media_url, caption, created_at, user_id')
      .eq('media_type', 'image')
      .not('media_url', 'is', null);

    if (error) {
      console.error('❌ Error fetching stories:', error);
      return { error: error.message };
    }

    // Filter stories with local file URLs
    const badStories = stories.filter(story => 
      story.media_url && story.media_url.startsWith('file://')
    );

    const goodStories = stories.filter(story => 
      story.media_url && story.media_url.startsWith('https://')
    );

    console.log(`📊 Found ${stories.length} total image stories:`);
    console.log(`❌ ${badStories.length} with local file URLs (need fixing)`);
    console.log(`✅ ${goodStories.length} with proper HTTPS URLs`);

    return {
      total: stories.length,
      bad: badStories.length,
      good: goodStories.length,
      badStories: badStories,
      goodStories: goodStories
    };

  } catch (error) {
    console.error('❌ Error in findStoriesWithBadUrls:', error);
    return { error: error.message };
  }
};

export const runCleanupDiagnostics = async () => {
  console.log('🧹 Running cleanup diagnostics...');
  console.log('====================================');

  try {
    // Check messages
    const messageResults = await findMessagesWithBadUrls();
    
    // Check stories  
    const storyResults = await findStoriesWithBadUrls();

    const summary = {
      messages: messageResults,
      stories: storyResults,
      totalIssues: (messageResults.bad || 0) + (storyResults.bad || 0),
      timestamp: new Date().toISOString()
    };

    console.log('\n📋 CLEANUP SUMMARY:');
    console.log('====================================');
    console.log(`📱 Messages: ${messageResults.bad || 0} need fixing, ${messageResults.good || 0} are good`);
    console.log(`📖 Stories: ${storyResults.bad || 0} need fixing, ${storyResults.good || 0} are good`);
    console.log(`🚨 Total items needing cleanup: ${summary.totalIssues}`);

    if (summary.totalIssues > 0) {
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      console.log('====================================');
      console.log('1. Run markBadMessagesAsUnavailable() to clean up bad message URLs');
      console.log('2. Delete and re-create problematic stories');
      console.log('3. Test new uploads to ensure they work correctly');
      console.log('4. Monitor future uploads to prevent this issue');
    } else {
      console.log('\n✅ No cleanup needed - all URLs are properly formatted!');
    }

    return summary;

  } catch (error) {
    console.error('❌ Error in cleanup diagnostics:', error);
    return { error: error.message };
  }
}; 