import React from 'react';
import { Code, Smartphone, Palette, Bug, Server, Settings } from 'lucide-react';

interface Category {
  icon: React.ReactNode;
  name: string;
  count: number;
}

const CategoriesSection: React.FC = () => {
  const categories: Category[] = [
    { icon: <Code className="w-6 h-6" />, name: 'Web Development', count: 120 },
    { icon: <Smartphone className="w-6 h-6" />, name: 'Mobile App', count: 85 },
    { icon: <Palette className="w-6 h-6" />, name: 'UI/UX Design', count: 95 },
    { icon: <Bug className="w-6 h-6" />, name: 'Testing/QA', count: 60 },
    { icon: <Server className="w-6 h-6" />, name: 'DevOps', count: 45 },
    { icon: <Settings className="w-6 h-6" />, name: 'Project Management', count: 70 }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Các Lĩnh Vực IT
          </h2>
          <p className="text-xl text-gray-600">
            Đa dạng chuyên môn từ các chuyên gia hàng đầu
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-blue-600">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {category.name}
                </h3>
              </div>
              <p className="text-gray-600">
                {category.count} chuyên gia
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;