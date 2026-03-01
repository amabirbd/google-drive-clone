"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UpgradePage() {
    const [packages, setPackages] = useState<any[]>([])
    const [activeSub, setActiveSub] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
                const [pkgsRes, activeRes] = await Promise.all([
                    fetch(`${baseUrl}/api/packages`),
                    fetch(`${baseUrl}/api/subscriptions/active`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ])

                if (pkgsRes.ok) setPackages(await pkgsRes.json())
                if (activeRes.ok) setActiveSub(await activeRes.json())
            } catch (err) {
                console.error('Failed to fetch subscription data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    const handleSubscribe = async (packageId: string) => {
        setSubmitting(packageId)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/subscriptions/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ packageId })
            })

            if (response.ok) {
                router.push('/dashboard')
            } else {
                alert('Subscription failed. Please try again.')
            }
        } catch (err) {
            alert('Subscription failed.')
        } finally {
            setSubmitting(null)
        }
    }

    if (loading) return <div className="flex min-h-screen items-center justify-center">Loading plans...</div>

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-6 py-20 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <Link href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center gap-1 mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-4 tracking-tight">Choose your plan</h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        Scale your storage as you grow. All plans include secure encryption and 24/7 access.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {packages.map((pkg: any) => {
                        const isActive = activeSub?.packageId === pkg.id
                        const isPro = pkg.name.toLowerCase().includes('pro')
                        const isEntreprise = pkg.name.toLowerCase().includes('enterprise')

                        return (
                            <div
                                key={pkg.id}
                                className={`relative flex flex-col p-8 rounded-3xl border bg-white dark:bg-zinc-900 shadow-xl transition-all hover:scale-[1.02] ${isPro ? 'border-zinc-900 dark:border-zinc-50 ring-2 ring-zinc-900 dark:ring-zinc-50' : 'border-zinc-200 dark:border-zinc-800'
                                    }`}
                            >
                                {isPro && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-xs font-bold rounded-full uppercase tracking-widest">
                                        Most Popular
                                    </span>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{pkg.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">${pkg.price}</span>
                                        <span className="text-zinc-500">/month</span>
                                    </div>
                                </div>

                                <ul className="flex-1 space-y-4 mb-10">
                                    <li className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <strong>{pkg.maxStorageGB} GB</strong> Storage
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <strong>{pkg.maxFileSizeMB} MB</strong> Max File Size
                                    </li>
                                </ul>

                                <button
                                    disabled={isActive || submitting !== null}
                                    onClick={() => handleSubscribe(pkg.id)}
                                    className={`w-full py-4 px-6 rounded-2xl text-sm font-bold transition-all shadow-lg ${isActive
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-700'
                                            : isPro
                                                ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:opacity-90'
                                                : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                                        }`}
                                >
                                    {submitting === pkg.id ? 'Processing...' : isActive ? 'Current Plan' : 'Get Started'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
