import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Headphones } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 p-4 rounded-full mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Customer</CardTitle>
            <CardDescription>
              Need help with your loan? Chat with us.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/customer">
              <Button size="lg" className="w-full md:w-auto">
                Continue as Customer
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-4 rounded-full mb-4">
              <Headphones className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Agent</CardTitle>
            <CardDescription>
              Manage support tickets and help customers.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/agent">
              <Button size="lg" variant="outline" className="w-full md:w-auto">
                Continue as Agent
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
