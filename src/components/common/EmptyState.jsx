import { FileX } from 'lucide-react';

const EmptyState = ({
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  icon: Icon = FileX,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-secondary-400" />
      </div>
      <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
        {title}
      </h3>
      <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-sm">
        {description}
      </p>
      {action}
    </div>
  );
};

export default EmptyState;
