import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { Users, MessageSquare, Heart, TrendingUp } from 'lucide-react';

export default function Community() {
  const posts = [
    {
      author: 'Sarah M.',
      avatar: 'SM',
      time: '2 hours ago',
      title: 'My Journey to Better Gut Health',
      excerpt: 'After 3 months of following the recommendations, I\'ve seen amazing improvements...',
      likes: 24,
      comments: 12,
    },
    {
      author: 'John D.',
      avatar: 'JD',
      time: '5 hours ago',
      title: 'Tips for Managing IBS Symptoms',
      excerpt: 'Here are some strategies that have really helped me manage my symptoms...',
      likes: 18,
      comments: 8,
    },
    {
      author: 'Emily R.',
      avatar: 'ER',
      time: '1 day ago',
      title: 'Question About Probiotic Foods',
      excerpt: 'Can anyone recommend good probiotic-rich foods to add to my diet?',
      likes: 15,
      comments: 23,
    },
  ];

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
              <p className="text-gray-600">Connect with others on their gut health journey</p>
            </div>
            <Button className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              New Post
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <Users className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">12.5K</p>
              <p className="text-sm text-gray-600">Members</p>
            </Card>
            <Card className="text-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">3.2K</p>
              <p className="text-sm text-gray-600">Discussions</p>
            </Card>
            <Card className="text-center">
              <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">45K</p>
              <p className="text-sm text-gray-600">Helpful Votes</p>
            </Card>
            <Card className="text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">89%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {posts.map((post) => (
                <Card key={post.title}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{post.author}</span>
                        <span className="text-sm text-gray-500">{post.time}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-pink-600 transition-colors">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Community Guidelines</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Be respectful and supportive</li>
                  <li>Share experiences, not medical advice</li>
                  <li>Protect privacy and confidentiality</li>
                  <li>Report inappropriate content</li>
                </ul>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {['IBS', 'Diet Tips', 'Probiotics', 'Success Stories', 'Recipes'].map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
