export function burstConfetti(x = window.innerWidth / 2, y = window.innerHeight / 2, colors = ["#7c3aed", "#06b6d4", "#f97316"]) {
  const parent = document.createElement("div");
  parent.style.position = "fixed";
  parent.style.left = "0";
  parent.style.top = "0";
  parent.style.width = "100%";
  parent.style.height = "100%";
  parent.style.pointerEvents = "none";
  parent.style.overflow = "visible";
  parent.style.zIndex = 9999;

  for (let i = 0; i < 30; i++) {
    const el = document.createElement("div");
    const size = 6 + Math.random() * 10;
    el.style.position = "absolute";
    el.style.left = `${x + (Math.random() - 0.5) * 120}px`;
    el.style.top = `${y + (Math.random() - 0.5) * 40}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.borderRadius = "2px";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.opacity = `${0.9 - Math.random() * 0.5}`;
    el.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;
    el.style.transition = `transform 900ms cubic-bezier(.2,.8,.2,1), opacity 900ms ease-out`;
    parent.appendChild(el);

    // animate
    requestAnimationFrame(() => {
      el.style.transform = `translate(${(Math.random() - 0.5) * 600}px, ${(Math.random() * 600 + 50)}px) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = "0";
    });
  }

  document.body.appendChild(parent);
  setTimeout(() => document.body.removeChild(parent), 1000);
}
