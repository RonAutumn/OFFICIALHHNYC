import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center py-4">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          onClick={() => onCategoryChange(category)}
          className={`
            transition-all duration-200 hover:scale-105
            ${activeCategory === category ? 'bg-primary text-white' : 'bg-card text-foreground hover:bg-card-hover'}
          `}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};