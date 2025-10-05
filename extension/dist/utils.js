const E=(t,s)=>{const e=new Date,r=new Date(t),n=s?new Date(s):e,i=r.getTime()-n.getTime(),o=r.getTime()-e.getTime(),c=o<0,a=Math.abs(o)/1e3,m=Math.floor(a/(24*60*60)),g=Math.floor(a%(24*60*60)/(60*60)),D=Math.floor(a%(60*60)/60),h=Math.floor(a%60),l=i>0?Math.max(0,Math.min(1,(i-o)/i)):0;return{days:m,hours:g,minutes:D,seconds:h,totalSeconds:a,isOverdue:c,progress:l}},u=t=>t.isOverdue?`Overdue by ${t.days}d ${t.hours}h ${t.minutes}m`:t.days>0?`${t.days}d ${t.hours}h remaining`:t.hours>0?`${t.hours}h ${t.minutes}m remaining`:`${t.minutes}m ${t.seconds}s remaining`,N=(t,s=3)=>{const e=new Date;return t.filter(r=>!r.isArchived&&new Date(r.targetAt)>e).sort((r,n)=>new Date(r.targetAt).getTime()-new Date(n.targetAt).getTime()).slice(0,s)},T=t=>JSON.stringify(t,null,2),f=t=>{try{const s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{throw new Error("Invalid JSON format")}},A=t=>{const s=r=>new Date(r).toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";let e=`BEGIN:VCALENDAR
`;return e+=`VERSION:2.0
`,e+=`PRODID:-//DayCounter//Event Tracker//EN
`,t.forEach(r=>{e+=`BEGIN:VEVENT
`,e+=`UID:${r.id}@daycounter.app
`,e+=`DTSTART:${s(r.startAt||r.createdAt)}
`,e+=`DTEND:${s(r.targetAt)}
`,e+=`SUMMARY:${r.title}
`,r.description&&(e+=`DESCRIPTION:${r.description}
`),e+=`END:VEVENT
`}),e+=`END:VCALENDAR
`,e};export{A as a,E as c,T as e,u as f,N as g,f as i};
