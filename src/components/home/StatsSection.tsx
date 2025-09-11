import React from 'react';

interface Stat {
  number: string;
  label: string;
}

const StatsSection: React.FC = () => {
  const stats: Stat[] = [
    { number: '1,000+', label: 'Dự Án' },
    { number: '500+', label: 'Chuyên Gia IT' },
    { number: '95%', label: 'Hài Lòng' },
    { number: '24/7', label: 'Hỗ Trợ' }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-700 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;