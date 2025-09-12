import type React from "react"
import { Code, Smartphone, Palette, ArrowRight } from "lucide-react"

interface Category {
  icon: React.ReactNode
  name: string
  count: number
  skills: string[]
  iconColor: string
}

const CategoriesSection: React.FC = () => {
  const categories: Category[] = [
    {
      icon: <Code className="w-6 h-6" />,
      name: "Web Development",
      count: 250,
      skills: ["ReactJS", "NodeJS", "PHP", "Laravel", "Vue.js"],
      iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      name: "Mobile App",
      count: 180,
      skills: ["React Native", "Flutter", "iOS", "Android", "Kotlin"],
      iconColor: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      name: "UI/UX Design",
      count: 150,
      skills: ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator"],
      iconColor: "bg-gradient-to-br from-purple-500 to-violet-600",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Các Lĩnh Vực IT</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Đa dạng chuyên môn từ các chuyên gia hàng đầu trong ngành công nghệ
          </p>
        </div>

        <div className="space-y-8">
          {/* Single row - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className={`${category.iconColor} p-4 rounded-xl text-white shadow-lg`}>{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-gray-600 font-medium">{category.count}+ chuyên gia</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100 hover:from-blue-100 hover:to-purple-100 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <a
                    href="#"
                    className="inline-flex items-center text-blue-600 hover:text-purple-600 font-semibold transition-colors group"
                  >
                    Xem tất cả chuyên gia
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
