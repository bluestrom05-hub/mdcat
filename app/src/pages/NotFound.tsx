import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-500 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
