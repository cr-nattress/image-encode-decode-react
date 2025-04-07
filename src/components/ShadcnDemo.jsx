import React from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';

const ShadcnDemo = () => {
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">shadcn/ui Components</h2>
      
      <Card className="mb-6 hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Button Components</CardTitle>
          <CardDescription>Various button styles from shadcn/ui</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </CardContent>
      </Card>

      <Card className="mb-6 hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Input Component</CardTitle>
          <CardDescription>Text input from shadcn/ui</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Regular input" />
          <Input placeholder="Disabled input" disabled />
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Card Component</CardTitle>
          <CardDescription>Card layout from shadcn/ui</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is an example of the Card component with various sections.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Submit</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShadcnDemo;
