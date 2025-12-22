const ghostContainer = document.getElementById('ghost-container');
const ghostImg = document.getElementById('ghost-image');
const links = document.querySelectorAll('.hover-trigger');

// STATE
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentX = 0;
let currentY = 0;
let spawnX = 0;
let spawnY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animate() {
    // Parallax Amount (0.05 = subtle movement)
    const driftX = (mouseX - window.innerWidth / 2) * 0.05;
    const driftY = (mouseY - window.innerHeight / 2) * 0.05;

    const targetX = spawnX + driftX;
    const targetY = spawnY + driftY;

    // INCREASED SPEED: Changed 0.05 to 0.1 for less "lag"
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;

    ghostContainer.style.left = currentX + 'px';
    ghostContainer.style.top = currentY + 'px';

    requestAnimationFrame(animate);
}
animate();

links.forEach(link => {
    const isTouch = 'ontouchstart' in window;

    const showGhost = () => {
        const src = link.getAttribute('data-img');
        ghostImg.src = src;

        // Limit spawn area to avoid nav and About link
        const nav = document.querySelector('nav');
        const navRect = nav ? nav.getBoundingClientRect() : { bottom: 0 };
        const spawnWidth = window.innerWidth - 350;
        const spawnHeight = window.innerHeight - 300;

        spawnX = Math.random() * spawnWidth;
        spawnY = navRect.bottom + Math.random() * (spawnHeight - navRect.bottom);

        // Snap current position to spawn for smooth animation
        currentX = spawnX + ((mouseX - window.innerWidth / 2) * 0.05);
        currentY = spawnY + ((mouseY - window.innerHeight / 2) * 0.05);

        ghostContainer.style.opacity = 1;
    };

    const hideGhost = () => {
        ghostContainer.style.opacity = 0;
    };

    if (isTouch) {
        link.addEventListener('touchstart', showGhost);
        link.addEventListener('touchend', hideGhost);
    } else {
        link.addEventListener('mouseenter', showGhost);
        link.addEventListener('mouseleave', hideGhost);
    }
});