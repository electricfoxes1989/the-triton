import { useState, useEffect, useRef } from "react";

export default function StatisticsSection() {
  const [counts, setCounts] = useState({ stat1: 0, stat2: 0, stat3: 0, stat4: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Animate to 22k
          let count1 = 0;
          const interval1 = setInterval(() => {
            count1 += 500;
            if (count1 >= 22000) {
              count1 = 22000;
              clearInterval(interval1);
            }
            setCounts(prev => ({ ...prev, stat1: count1 }));
          }, 30);

          // Animate to 25k
          let count2 = 0;
          const interval2 = setInterval(() => {
            count2 += 550;
            if (count2 >= 25000) {
              count2 = 25000;
              clearInterval(interval2);
            }
            setCounts(prev => ({ ...prev, stat2: count2 }));
          }, 30);

          // Animate to 27k
          let count3 = 0;
          const interval3 = setInterval(() => {
            count3 += 600;
            if (count3 >= 27000) {
              count3 = 27000;
              clearInterval(interval3);
            }
            setCounts(prev => ({ ...prev, stat3: count3 }));
          }, 30);

          // Animate to 2.5M
          let count4 = 0;
          const interval4 = setInterval(() => {
            count4 += 50000;
            if (count4 >= 2500000) {
              count4 = 2500000;
              clearInterval(interval4);
            }
            setCounts(prev => ({ ...prev, stat4: count4 }));
          }, 30);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const formatNumber = (num: number, isMillion: boolean = false) => {
    if (isMillion) {
      return (num / 1000000).toFixed(1) + 'M+';
    }
    return (num / 1000).toFixed(0) + 'k' + (num >= 25000 ? '+' : '');
  };

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-gray-300 mb-2">{formatNumber(counts.stat1)}</div>
            <div className="text-sm font-semibold text-gray-700 uppercase">Bi-monthly<br />Magazine</div>
            <div className="text-xs text-gray-500 mt-1">Printed and digital<br />distribution</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-gray-300 mb-2">{formatNumber(counts.stat2)}</div>
            <div className="text-sm font-semibold text-gray-700 uppercase">Boat Show Daily</div>
            <div className="text-xs text-gray-500 mt-1">Digital Subscribers.<br />Distributed at FLIBS and<br />Palm Beach boat shows</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-gray-300 mb-2">{formatNumber(counts.stat3)}</div>
            <div className="text-sm font-semibold text-gray-700 uppercase">Weekly News Brief</div>
            <div className="text-xs text-gray-500 mt-1">Email Subscribers</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-gray-300 mb-2">{formatNumber(counts.stat4, true)}</div>
            <div className="text-sm font-semibold text-gray-700 uppercase">Digital and Social<br />Media</div>
            <div className="text-xs text-gray-500 mt-1">Annual Impressions</div>
          </div>
        </div>
      </div>
    </section>
  );
}
