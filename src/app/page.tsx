
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePercent, Sparkles, CheckCircle2, LayoutGrid } from "lucide-react";
import Link from "next/link";

const featureCards = [
  {
    title: "Ethical Price Engine",
    description: "Get a fair price range based on real sales data, ensuring a quick and realistic sale.",
    icon: BadgePercent,
    href: "/verify",
  },
  {
    title: "Instant Listing Generator",
    description: "Generate a complete, professional listing from just a photo in seconds.",
    icon: Sparkles,
    href: "/list",
  },
  {
    title: "Scan Your Item",
    description: "Instantly identify any item to get its true resale or retail value.",
    icon: CheckCircle2,
    href: "/verify",
  },
  {
    title: "Marketplace",
    description: "Browse curated listings or sell your own items on our ethical exchange.",
    icon: LayoutGrid,
    href: "/marketplace",
  }
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to ReFurrm SmartScan</h1>
        <p className="text-muted-foreground">Your AI assistant for de-cluttering and ethical selling.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {featureCards.map((feature) => (
          <Link href={feature.href} key={feature.title} className="flex">
            <Card className="flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-shadow hover:bg-card/95 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{feature.title}</span>
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
