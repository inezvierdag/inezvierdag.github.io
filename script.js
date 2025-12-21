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
    link.addEventListener('mouseenter', function() {
        const src = this.getAttribute('data-img');
        ghostImg.src = src;

        // Random Spawn (Keep text clear area if possible, or fully random)
        spawnX = Math.random() * (window.innerWidth - 350);
        spawnY = Math.random() * (window.innerHeight - 300);
        
        // Snap current position to spawn so it doesn't fly in
        currentX = spawnX + ((mouseX - window.innerWidth / 2) * 0.05);
        currentY = spawnY + ((mouseY - window.innerHeight / 2) * 0.05);

        ghostContainer.style.opacity = 1;
    });

    link.addEventListener('mouseleave', function() {
        ghostContainer.style.opacity = 0;
    });
});