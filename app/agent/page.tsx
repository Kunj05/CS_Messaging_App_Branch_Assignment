'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AgentLoginPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/agent/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                // Store agent name in localStorage
                localStorage.setItem('agentName', name);
                router.push('/agent/dashboard');
            } else {
                console.error('Login failed');
                setLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-sm w-full">
                <CardHeader>
                    <CardTitle>Agent Login</CardTitle>
                    <CardDescription>
                        Enter your name to access the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Agent Name
                            </label>
                            <Input
                                id="name"
                                required
                                placeholder="Nobita"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entering...
                                </>
                            ) : (
                                'Enter Dashboard'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
