
import { Package, Store, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategorySelectionProps {
  onSelect: (category: string) => void;
}

const CategorySelection = ({ onSelect }: CategorySelectionProps) => {
  const categories = [
    {
      id: 'grafico',
      name: 'Gráfico',
      description: 'Materiais impressos, banners, cartazes',
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'estrutura_lojas',
      name: 'Estrutura de Lojas',
      description: 'Displays, suportes, mobiliário',
      icon: Store,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      id: 'brindes',
      name: 'Brindes',
      description: 'Brindes promocionais, amostras',
      icon: Gift,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selecione a Categoria
        </h2>
        <p className="text-gray-600">
          Escolha o tipo de material que deseja retirar
        </p>
      </div>

      <div className="grid gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              onClick={() => onSelect(category.id)}
              variant="outline"
              className="h-auto p-6 text-left hover:shadow-lg transition-all duration-300 rounded-2xl border-2 hover:border-primary"
            >
              <div className="flex items-center w-full">
                <div className={`
                  flex items-center justify-center w-16 h-16 rounded-xl mr-6
                  ${category.bgColor}
                `}>
                  <Icon className={`w-8 h-8 ${category.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-gray-600">
                    {category.description}
                  </p>
                </div>
                <div className="text-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelection;
