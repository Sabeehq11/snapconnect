import { supabase } from '../../lib/supabase';

/**
 * RAG Service for College Student Content Generation
 * Handles retrieval-augmented generation for personalized content
 */
export class RAGService {
  // OpenAI API configuration
  static OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY || null;
  static OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  /**
   * Make OpenAI API call
   */
  static async callOpenAI(prompt, temperature = 0.7, maxTokens = 400) {
    try {
      // Check if API key is available
      if (!this.OPENAI_API_KEY || this.OPENAI_API_KEY === 'your-openai-key-here') {
        console.warn('⚠️ RAG: No OpenAI API key configured, using fallback content');
        throw new Error('No API key configured');
      }

      console.log('🔍 RAG: Making OpenAI API call with prompt length:', prompt.length);

      const response = await fetch(this.OPENAI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ RAG: OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid OpenAI response structure');
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error('❌ RAG: OpenAI API call failed:', error);
      throw error;
    }
  }

  /**
   * Get user context for RAG - retrieves user data and preferences
   */
  static async getUserContext(userId) {
    try {
      console.log('🔍 RAG: Retrieving user context for', userId);
      
      // Get user profile
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Get user's chat IDs first
      const { data: userChats } = await supabase
        .from('chats')
        .select('id')
        .contains('participants', [userId]);

      const chatIds = userChats?.map(chat => chat.id) || [];

      // Get recent messages for context (both sent and received from all user's chats)
      let recentMessages = [];
      if (chatIds.length > 0) {
        const { data: messages } = await supabase
          .from('messages')
          .select('content, message_type, created_at, sender_id, chat_id, sender:users!sender_id(display_name)')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false })
          .limit(30);
        recentMessages = messages || [];
      }

      // Get friend list for social context
      const { data: friends } = await supabase
        .rpc('get_user_friends');

      // Get recent stories for content history
      const { data: recentStories } = await supabase
        .from('stories')
        .select('caption, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const context = {
        user: {
          displayName: user?.display_name || 'Student',
          email: user?.email,
          username: user?.username,
          createdAt: user?.created_at,
        },
        recentMessages: recentMessages?.map(msg => ({
          content: msg.content,
          type: msg.message_type,
          timestamp: msg.created_at,
          isFromUser: msg.sender_id === userId,
          senderName: msg.sender?.display_name || 'Unknown',
        })) || [],
        friends: friends?.map(friend => ({
          name: friend.display_name,
          username: friend.username,
        })) || [],
        recentStories: recentStories?.map(story => ({
          caption: story.caption,
          timestamp: story.created_at,
        })) || [],
        friendCount: friends?.length || 0,
      };

      console.log('✅ RAG: User context retrieved', { 
        messagesCount: context.recentMessages.length,
        friendsCount: context.friendCount,
        storiesCount: context.recentStories.length
      });

      return context;
    } catch (error) {
      console.error('❌ RAG: Error retrieving user context:', error);
      return null;
    }
  }

  /**
   * Generate fun caption suggestions for study group photos
   */
  static async generateStudyGroupCaptions(userId, imageContext = '') {
    try {
      console.log('🎓 RAG: Generating study group captions for user', userId);
      
      const userContext = await this.getUserContext(userId);
      if (!userContext) throw new Error('Could not retrieve user context');

      const prompt = `You are a witty college student helping ${userContext.user.displayName} create fun captions for study group photos. 

User Context:
- Has ${userContext.friendCount} friends
- Recent messages show: ${userContext.recentMessages.slice(0, 3).map(m => m.content).join(', ')}
- Recent story themes: ${userContext.recentStories.slice(0, 2).map(s => s.caption).join(', ')}

Image Context: ${imageContext || 'Study group photo'}

Generate 5 fun, relatable captions that include:
- Inside jokes about college life
- References to study struggles
- Funny observations about friend dynamics
- Trending college memes or phrases
- Encouraging but humorous tone

Keep captions under 100 characters and use emojis appropriately. Make them sound natural for a college student. Return only the captions, one per line.`;

      const response = await this.callOpenAI(prompt, 0.8, 400);
      console.log('🔍 RAG: Raw OpenAI response:', response);
      
      const captions = response
        .split('\n')
        .filter(line => line.trim() && line.match(/^\d+\./))
        .map(caption => {
          // Remove the number prefix (e.g., "1. ") and any surrounding quotes
          let cleaned = caption.replace(/^\d+\.\s*/, '').trim();
          // Remove surrounding quotes if they exist
          if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1);
          }
          return cleaned;
        })
        .filter(caption => caption.length > 0)
        .slice(0, 5);

      console.log('✅ RAG: Parsed captions:', captions);
      
      // If no captions were generated, use fallback
      if (captions.length === 0) {
        console.log('⚠️ RAG: No captions generated from API, using fallback');
        const fallbackCaptions = [
          "Squad study session activated! 📚✨",
          "When your study group actually studies 🤯",
          "Brain cells working overtime with the crew 🧠💪", 
          "Study hard, laugh harder with these legends 📖😂",
          "Future graduates loading... 🎓⏳"
        ];
        return fallbackCaptions;
      }
      
      return captions;
    } catch (error) {
      console.error('❌ RAG: Error generating study group captions:', error);
      return [
        "Squad study session activated! 📚✨",
        "When your study group actually studies 🤯",
        "Brain cells working overtime with the crew 🧠💪", 
        "Study hard, laugh harder with these legends 📖😂",
        "Future graduates loading... 🎓⏳"
      ];
    }
  }

  /**
   * Generate story ideas based on campus activities
   */
  static async generateCampusStoryIdeas(userId) {
    try {
      console.log('🏫 RAG: Generating campus story ideas for user', userId);
      
      const userContext = await this.getUserContext(userId);
      if (!userContext) throw new Error('Could not retrieve user context');

      const prompt = `You are a creative college student helping ${userContext.user.displayName} come up with engaging story ideas for campus life.

User Context:
- Active since: ${new Date(userContext.user.createdAt).toLocaleDateString()}
- Social circle: ${userContext.friendCount} friends
- Recent activity themes: ${userContext.recentStories.slice(0, 3).map(s => s.caption).join(', ')}

Generate 8 engaging story ideas covering different aspects of campus life:
- Study spots and library adventures
- Dining hall discoveries
- Campus events and activities
- Dorm life moments
- Class experiences
- Weekend campus activities
- Seasonal campus vibes
- Student organization involvement

Each idea should be:
- Relatable to college students
- Visually interesting for stories
- Encourage friend engagement
- Include suggested hashtags
- 2-3 sentences max per idea

Format as: "Title: Description with suggested approach"`;

      const response = await this.callOpenAI(prompt, 0.7, 600);
      
      const ideas = response
        .split('\n')
        .filter(line => line.includes(':') && line.trim().length > 0)
        .slice(0, 8);

      console.log('✅ RAG: Generated campus story ideas:', ideas);
      
      // Ensure we always return at least some ideas
      if (ideas.length === 0) {
        throw new Error('No valid ideas generated');
      }
      
      return ideas;
    } catch (error) {
      console.error('❌ RAG: Error generating campus story ideas:', error);
      return [
        "Hidden Study Spot: Share your secret quiet place on campus with aesthetic shots #StudyVibes",
        "Dining Hall Review: Rate today's meal with dramatic reactions #CampusFood",
        "Library Late Night: Document your study marathon with time-lapse clips #AllNighter",
        "Campus Walk: Show off seasonal changes around campus #CampusLife",
        "Dorm Room Tour: Quick peek at your cozy study setup #DormDecor",
        "Class Reaction: Your face when professor announces surprise quiz #StudentLife",
        "Friend Group Study: Capture your squad's pre-exam energy #StudySquad",
        "Campus Event: Behind-the-scenes of student activities #CampusEvents"
      ];
    }
  }

  /**
   * Generate personalized content prompts for events
   */
  static async generateEventPrompts(userId, eventType = 'general') {
    try {
      console.log('🎉 RAG: Generating event prompts for', eventType, 'user', userId);
      
      const userContext = await this.getUserContext(userId);
      if (!userContext) throw new Error('Could not retrieve user context');

      const prompt = `You are helping ${userContext.user.displayName} create engaging content for a ${eventType} event.

User Context:
- Username: ${userContext.user.username}
- Friend network: ${userContext.friendCount} friends
- Content style: ${userContext.recentStories.slice(0, 2).map(s => s.caption).join(', ')}

Generate 6 specific content prompts for ${eventType} events that:
- Encourage authentic moments
- Include friend interactions
- Show college personality
- Use current social media trends
- Are easy to capture on phone

Each prompt should include:
- What to capture
- How to frame it
- Suggested caption style
- Engagement hook

Format as clear, actionable prompts.`;

      const response = await this.callOpenAI(prompt, 0.7, 500);
      
      const prompts = response
        .split('\n')
        .filter(line => line.trim())
        .slice(0, 6);

      console.log('✅ RAG: Generated event prompts:', prompts);
      return prompts;
    } catch (error) {
      console.error('❌ RAG: Error generating event prompts:', error);
      return [
        "Capture the pre-event excitement with friends getting ready together",
        "Document the best moments with candid reaction shots",
        "Show the event atmosphere with wide shots and close-ups",
        "Get group photos with creative poses and genuine smiles",
        "Record short clips of favorite moments to share later",
        "Take behind-the-scenes shots that others won't see"
      ];
    }
  }

  /**
   * Generate friend recommendations based on shared interests
   */
  static async generateFriendRecommendations(userId) {
    try {
      console.log('👥 RAG: Generating friend recommendations for user', userId);
      
      const userContext = await this.getUserContext(userId);
      if (!userContext) throw new Error('Could not retrieve user context');

      // Get other users for potential recommendations
      const { data: potentialFriends } = await supabase
        .from('users')
        .select('id, username, display_name, email, created_at')
        .neq('id', userId)
        .limit(20);

      // Filter out existing friends
      const existingFriendIds = userContext.friends.map(f => f.id);
      const candidates = potentialFriends?.filter(
        user => !existingFriendIds.includes(user.id)
      ) || [];

      const prompt = `You are helping ${userContext.user.displayName} find compatible friends on a college social app.

Current User Profile:
- Username: ${userContext.user.username}
- Member since: ${new Date(userContext.user.createdAt).toLocaleDateString()}
- Current friends: ${userContext.friendCount}
- Recent activity: ${userContext.recentMessages.slice(0, 3).map(m => m.content).join(', ')}

Potential Friends: ${candidates.slice(0, 10).map(c => 
  `${c.display_name} (@${c.username}) - joined ${new Date(c.created_at).toLocaleDateString()}`
).join(', ')}

Based on college student connection patterns, rank the top 5 potential friends and provide reasoning:
- Similar join dates (same semester/year)
- Compatible usernames/display names
- Likely shared campus experiences
- Good social dynamic potential

Format as: "Name (@username): Why you might connect - [reason]"`;

      const response = await this.callOpenAI(prompt, 0.6, 400);
      
      const recommendations = response
        .split('\n')
        .filter(line => line.includes(':'))
        .slice(0, 5);

      console.log('✅ RAG: Generated friend recommendations:', recommendations);
      return recommendations;
    } catch (error) {
      console.error('❌ RAG: Error generating friend recommendations:', error);
      return [
        "Check out classmates who joined around the same time as you",
        "Look for users with similar interests in their usernames",
        "Connect with people who share your campus activities",
        "Find study partners through mutual friends",
        "Join conversations in group chats to meet new people"
      ];
    }
  }

  /**
   * Generate academic stress/exam content
   */
  static async generateAcademicContent(userId, contentType = 'stress') {
    try {
      console.log('📚 RAG: Generating academic content for', contentType, 'user', userId);
      
      const userContext = await this.getUserContext(userId);
      if (!userContext) throw new Error('Could not retrieve user context');

      const prompt = `You are helping ${userContext.user.displayName} create relatable content about ${contentType} during college.

User Context:
- Recent posts: ${userContext.recentStories.slice(0, 2).map(s => s.caption).join(', ')}
- Social network: ${userContext.friendCount} friends
- Content style: College student, authentic, humorous but supportive

Generate 6 caption options for ${contentType} content that:
- Acknowledge the struggle authentically
- Include encouraging elements
- Use relatable college humor
- Promote healthy coping
- Encourage friend support
- Use appropriate emojis

Keep captions under 120 characters and make them shareable. Return only the captions, one per line.`;

      const response = await this.callOpenAI(prompt, 0.7, 400);
      
      const captions = response
        .split('\n')
        .filter(line => line.trim() && !line.match(/^\d+\./))
        .map(caption => caption.replace(/^[\d.-]+\s*/, '').trim())
        .filter(caption => caption.length > 0)
        .slice(0, 6);

      console.log('✅ RAG: Generated academic content:', captions);
      
      // Ensure we always return at least some captions
      if (captions.length === 0) {
        throw new Error('No valid captions generated');
      }
      
      return captions;
    } catch (error) {
      console.error('❌ RAG: Error generating academic content:', error);
      return [
        "Finals week energy: 5% knowledge, 95% caffeine ☕📚",
        "When you study so hard you forget your own name 🤯",
        "Stress level: college student during midterms 📈😅",
        "Plot twist: I actually understand this material now! 🎉",
        "Study buddy check-in: who else is surviving on snacks? 🍕",
        "Mental health reminder: you're doing great! 💪✨"
      ];
    }
  }

  /**
   * Generate trending campus content suggestions
   */
  static async generateTrendingContent(userId) {
    try {
      console.log('📈 RAG: Generating trending content for user', userId);
      
      const userContext = await this.getUserContext(userId);
      if (!userContext) throw new Error('Could not retrieve user context');

      const prompt = `You are a social media expert helping ${userContext.user.displayName} create content that resonates with current college trends.

User Context:
- Campus social member with ${userContext.friendCount} friends
- Recent content themes: ${userContext.recentStories.slice(0, 3).map(s => s.caption).join(', ')}

Create 8 trending content ideas that are:
- Currently popular on college campuses
- Easy to create with phone camera
- Encouraging friend participation
- Authentic to student experience
- Likely to get engagement

Include trending topics like:
- Study aesthetics
- Campus food reviews
- Dorm/apartment life
- Friend group dynamics
- College memes
- Seasonal campus activities
- Academic achievements
- Self-care moments

Format as: "Trend: [Description] - Caption idea: [example]"`;

      const response = await this.callOpenAI(prompt, 0.8, 600);
      
      const trends = response
        .split('\n')
        .filter(line => line.includes('Trend:'))
        .slice(0, 8);

      console.log('✅ RAG: Generated trending content:', trends);
      return trends;
    } catch (error) {
      console.error('❌ RAG: Error generating trending content:', error);
      return [
        "Study Aesthetic: Show your organized notes and setup - 'POV: Actually having your life together ✨📚'",
        "Campus Food Review: Rate dining hall meals dramatically - 'Reviewing today's mystery meat 🍖🤔'",
        "Friend Group Energy: Capture squad dynamics - 'When your study group gets distracted 😂👥'",
        "Dorm Life Reality: Show real student living - 'Dorm room tour but make it honest 🏠📦'",
        "Academic Wins: Celebrate small victories - 'When you actually understand the homework 🎉🧠'",
        "Campus Seasons: Document weather changes - 'Campus vibes changing with the seasons 🍂🏫'",
        "Late Night Study: Share study marathon moments - '3am and still going strong 💪🌙'",
        "Self-Care Sunday: Promote student wellness - 'Reminder: grades don't define you 💚✨'"
      ];
    }
  }

  /**
   * Generate AI chat responses for the AI assistant
   */
  static async generateAIChatResponse(userId, userMessage, conversationHistory = []) {
    try {
      console.log('🤖 RAG: Generating AI chat response for user', userId);
      
      const userContext = await this.getUserContext(userId);
      if (!userContext) throw new Error('Could not retrieve user context');

      // Format conversation history for better context
      const recentConversation = conversationHistory
        .slice(-8) // Get last 8 messages for better context
        .reverse() // Show in chronological order (oldest first)
        .map(m => `${m.isAI ? 'AI Assistant' : userContext.user.displayName || 'Student'}: ${m.content}`)
        .join('\n');

      const prompt = `You are a helpful, friendly AI assistant for college students. You're like a supportive friend who's knowledgeable and caring.

Student Context:
- Name: ${userContext.user.displayName || 'Student'}
- Has ${userContext.friendCount} friends on campus
- Recent messages from all chats: ${userContext.recentMessages.slice(0, 5).map(m => 
  `${m.isFromUser ? 'You' : m.senderName}: "${m.content}"`
).join(' | ')}

CONVERSATION HISTORY:
${recentConversation}

IMPORTANT: You have access to both this AI chat conversation history AND the student's recent messages from all their chats with friends. 

If the student is asking you to help respond to a recent message from a friend, or if they mention something that happened in their other chats, use that context from their "Recent messages from all chats" to give relevant advice or help craft responses.

Read the conversation history above carefully. The student's most recent message is at the end. Respond naturally to what they just said, taking into account:
1. The full AI conversation context
2. Their recent messages with friends (if relevant)
3. Any follow-up questions or topic changes

Your response should:
- Directly address their most recent message
- Reference previous parts of the conversation when relevant
- Be helpful, friendly, and supportive (like a good friend)
- Stay concise but thorough (1-4 sentences usually)
- Be appropriate for college students
- Use natural, conversational language
- Include emojis occasionally but not excessively

Topics you can help with:
- Academic questions, study tips, exam prep
- Campus life advice and social situations  
- Emotional support and encouragement
- Planning and organization
- Casual conversation and interests
- Problem-solving and decision making
- Help responding to friends' messages
- Advice on social interactions and relationships

Examples of using chat context:
- If friend recently said "hey what's going on?" → Suggest responses like "Not much, just studying! How about you?"
- If friend shared exciting news → Help celebrate or ask follow-up questions
- If friend seems stressed → Suggest supportive responses
- If making plans → Help coordinate or suggest ideas

Avoid:
- Medical or legal advice
- Inappropriate content
- Being overly formal or robotic
- Making up facts or information

Respond as if you're texting with a good friend who knows the conversation context.`;

      const response = await this.callOpenAI(prompt, 0.8, 350);
      console.log('✅ RAG: Generated AI chat response:', response);
      return response.trim();
    } catch (error) {
      console.error('❌ RAG: Error generating AI chat response:', error);
      throw error;
    }
  }
}

export default RAGService; 