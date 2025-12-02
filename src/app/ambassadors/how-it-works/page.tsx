
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AmbassadorHowItWorksPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight mt-2">ReFURRM Ambassador Program</h1>
        <p className="text-xl text-muted-foreground">Get help with the projects you cannot face alone.</p>
        <div className="flex justify-center gap-4">
            <Button asChild>
                <Link href="/services">Request Ambassador Service</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/services">View Available Services</Link>
            </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>What Ambassadors Do</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
           <ul className="list-disc list-inside space-y-1">
              <li>Help with storage units, garages, homes, and inherited spaces</li>
              <li>Sort items into Keep / ReFURRBISH / Donate</li>
              <li>Flag sentimental or “never meant to be sold” items</li>
              <li>Use SmartScan to verify value and log important items</li>
            </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ideal For</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Cleaning out a storage unit or inherited property</li>
              <li>Overwhelming clutter or mixed emotional items</li>
              <li>Preparing a unit before an auction</li>
              <li>Organizing items before donation or resale</li>
            </ul>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How The Ambassador Program Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center">1</Badge> Request</h3>
            <div className="border-l-2 ml-4 pl-6 mt-2 space-y-2 text-muted-foreground">
                <p>Select “Request an Ambassador Service” inside the app.</p>
                <p>Choose service type: clean-out, organization, downsizing, donation support, storage unit assistance.</p>
                <p>Enter ZIP code and project notes.</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center">2</Badge> Review</h3>
            <div className="border-l-2 ml-4 pl-6 mt-2 space-y-2 text-muted-foreground">
                <p>A certified Ambassador reviews your request and may ask for photos or more details.</p>
                <p>If no Ambassador is available, you get a notice and an option to join the waitlist.</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center">3</Badge> On Site Visit</h3>
             <div className="border-l-2 ml-4 pl-6 mt-2 space-y-2 text-muted-foreground">
                <p>Ambassador walks through the space with you.</p>
                <p>Items are sorted into Keep / ReFURRBISH / Donate.</p>
                <p>Nothing is removed or discarded without your permission.</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center">4</Badge> Report</h3>
             <div className="border-l-2 ml-4 pl-6 mt-2 space-y-2 text-muted-foreground">
                <p>You receive a digital project summary in the app showing:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Total items processed</li>
                    <li>Items flagged as sentimental</li>
                    <li>Items added to ReFURRBISH</li>
                    <li>Items donated to support the LEAN Foundation</li>
                </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>How Pricing Works</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">
            <p>Pricing is based on project size and location, and you see an estimate before confirming.</p>
            <p className="mt-2">A portion of every project supports the LEAN Foundation and costs to return items to original owners.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader><CardTitle>Response Time</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">
            <p>Typical response time is 2 to 6 hours based on ZIP code and Ambassador availability. You will see a status inside your request: Pending Review, Assigned, In Progress, or Completed.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Boundaries and Safety</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-lg text-green-600">Ambassadors Are:</h3>
                     <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                        <li>Trained ethical intake partners</li>
                        <li>Respectful and trauma aware</li>
                        <li>Focused on salvage, sorting, and documentation</li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-semibold text-lg text-red-600">Ambassadors Are Not:</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                        <li>Not movers or junk haulers</li>
                        <li>Not legal advisors</li>
                        <li>Not buyers looking to profit off your loss</li>
                    </ul>
                </div>
            </div>
        </CardContent>
      </Card>
      
       <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
            <CardTitle>Why The Ambassador Program Matters</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
            <p>No one should stand alone in a unit full of memories, debt notices, and hard choices. Ambassadors give you a judgment-free partner who understands both the emotional weight and the practical work that needs to be done.</p>
        </CardContent>
      </Card>

      <footer className="text-center text-sm text-muted-foreground pt-4 border-t">
        For hardship related support, contact <a href="mailto:lean@refurrm.org" className="text-primary underline">lean@refurrm.org</a>.
      </footer>
    </div>
  );
}
