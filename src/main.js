import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

// =====================
// UTILITY FUNCTIONS
// =====================

// Custom Cursor
class CustomCursor {
  constructor() {
    if (window.matchMedia('(hover: none)').matches) return
    
    this.cursor = document.createElement('div')
    this.cursor.className = 'custom-cursor'
    this.dot = document.createElement('div')
    this.dot.className = 'custom-cursor-dot'
    document.body.appendChild(this.cursor)
    document.body.appendChild(this.dot)
    
    this.mouseX = 0
    this.mouseY = 0
    this.cursorX = 0
    this.cursorY = 0
    this.dotX = 0
    this.dotY = 0
    
    this.init()
  }
  
  init() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX
      this.mouseY = e.clientY
    })
    
    document.querySelectorAll('a, button, .interactive, .gradient-card').forEach(el => {
      el.addEventListener('mouseenter', () => this.cursor?.classList.add('hovered'))
      el.addEventListener('mouseleave', () => this.cursor?.classList.remove('hovered'))
    })
    
    this.animate()
  }
  
  animate() {
    this.cursorX += (this.mouseX - this.cursorX) * 0.15
    this.cursorY += (this.mouseY - this.cursorY) * 0.15
    this.dotX += (this.mouseX - this.dotX) * 0.3
    this.dotY += (this.mouseY - this.dotY) * 0.3
    
    if (this.cursor) {
      this.cursor.style.transform = `translate(${this.cursorX - 10}px, ${this.cursorY - 10}px)`
    }
    if (this.dot) {
      this.dot.style.transform = `translate(${this.dotX - 3}px, ${this.dotY - 3}px)`
    }
    
    requestAnimationFrame(() => this.animate())
  }
}

// Magnetic Button
class MagneticButton {
  constructor(element) {
    this.element = element
    this.strength = 0.3
    
    if (window.matchMedia('(hover: none)').matches) return
    
    this.animate()
  }
  
  animate() {
    this.element.addEventListener('mousemove', (e) => {
      const rect = this.element.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      
      gsap.to(this.element, {
        x: x * this.strength,
        y: y * this.strength,
        duration: 0.3,
        ease: 'power2.out'
      })
    })
    
    this.element.addEventListener('mouseleave', () => {
      gsap.to(this.element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      })
    })
  }
}

// Click Ripple Effect
function createRipple(x, y) {
  const ripple = document.createElement('div')
  ripple.className = 'ripple'
  ripple.style.left = `${x - 50}px`
  ripple.style.top = `${y - 50}px`
  document.body.appendChild(ripple)
  
  setTimeout(() => ripple.remove(), 600)
}

// Split Text Animation
class SplitText {
  constructor(element) {
    this.element = element
    this.text = element.textContent
    this.animate()
  }
  
  animate() {
    this.element.innerHTML = this.text
      .split('')
      .map(char => `<span>${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('')
    
    const spans = this.element.querySelectorAll('span')
    spans.forEach((span, i) => {
      span.style.animationDelay = `${i * 0.03}s`
    })
    
    setTimeout(() => {
      this.element.classList.add('animate')
    }, 100)
  }
}

// =====================
// SCROLL ANIMATIONS
// =====================
function setupScrollReveal() {
  const elements = document.querySelectorAll('.fade-in-up, .image-reveal')
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        
        if (entry.target.classList.contains('image-reveal')) {
          setTimeout(() => {
            entry.target.classList.add('revealed')
          }, 300)
        }
        
        // Stagger animation for child elements
        const children = entry.target.querySelectorAll('.stagger-item')
        children.forEach((child, i) => {
          setTimeout(() => {
            child.classList.add('visible')
          }, i * 100)
        })
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
  
  elements.forEach(el => observer.observe(el))
}

// Stats Counter
function setupStatsCounter() {
  const stats = document.querySelectorAll('.stat-number[data-count]')
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted')
        const target = parseInt(entry.target.dataset.count)
        const obj = { value: 0 }
        
        gsap.to(obj, {
          value: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function() {
            const val = Math.round(obj.value)
            if (target >= 1000) {
              entry.target.textContent = (val / 1000).toFixed(val >= 10000 ? 0 : 1) + 'K+'
            } else {
              entry.target.textContent = val + (target === 98 ? '%' : '+')
            }
          }
        })
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.5 })
  
  stats.forEach(stat => observer.observe(stat))
}

// Sticky Header with Morphing
function setupStickyHeader() {
  const header = document.querySelector('.sticky-header')
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled')
    } else {
      header?.classList.remove('scrolled')
    }
  })
}

// Dark Mode Toggle
function setupDarkMode() {
  const toggle = document.querySelector('.theme-toggle')
  let isDark = false
  
  toggle?.addEventListener('click', () => {
    isDark = !isDark
    document.body.classList.toggle('dark')
    
    gsap.to(toggle, {
      scale: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1
    })
  })
}

// =====================
// 3D COFFEE BEAN SCENE
// =====================
class CoffeeScene {
  constructor(container) {
    this.container = container
    this.width = container.clientWidth
    this.height = container.clientHeight
    
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000)
    this.camera.position.z = 5
    
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    container.appendChild(this.renderer.domElement)
    
    this.mouseX = 0
    this.mouseY = 0
    this.targetX = 0
    this.targetY = 0
    
    this.addLights()
    this.createCoffeeBeans()
    this.addParticles()
    this.animate()
    
    window.addEventListener('resize', () => this.onResize())
    document.addEventListener('mousemove', (e) => this.onMouseMove(e))
  }
  
  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1)
    keyLight.position.set(5, 5, 5)
    this.scene.add(keyLight)
    
    const fillLight = new THREE.DirectionalLight(0xE0C097, 0.5)
    fillLight.position.set(-5, 0, 5)
    this.scene.add(fillLight)
    
    const pointLight = new THREE.PointLight(0xE0C097, 0.5, 10)
    pointLight.position.set(2, 2, 2)
    this.scene.add(pointLight)
  }
  
  createCoffeeBeanGeometry() {
    const shape = new THREE.Shape()
    const radius = 0.4
    
    shape.moveTo(0, -radius)
    shape.bezierCurveTo(radius * 0.6, -radius, radius, -radius * 0.6, radius, 0)
    shape.bezierCurveTo(radius, radius * 0.6, radius * 0.6, radius, 0, radius)
    shape.bezierCurveTo(-radius * 0.6, radius, -radius, radius * 0.6, -radius, 0)
    shape.bezierCurveTo(-radius, -radius * 0.6, -radius * 0.6, -radius, 0, -radius)
    
    const extrudeSettings = {
      depth: 0.25,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3
    }
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }
  
  createCoffeeBeans() {
    this.beans = []
    const beanGeometry = this.createCoffeeBeanGeometry()
    
    const beanMaterial = new THREE.MeshStandardMaterial({
      color: 0x2D2424,
      roughness: 0.4,
      metalness: 0.1
    })
    
    for (let i = 0; i < 5; i++) {
      const bean = new THREE.Mesh(beanGeometry, beanMaterial)
      bean.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      )
      bean.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      bean.scale.setScalar(0.8 + Math.random() * 0.4)
      
      this.scene.add(bean)
      this.beans.push({
        mesh: bean,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01
        },
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2
      })
    }
  }
  
  addParticles() {
    const particleCount = 50
    const positions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10
      positions[i + 1] = (Math.random() - 0.5) * 10
      positions[i + 2] = (Math.random() - 0.5) * 10
    }
    
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const material = new THREE.PointsMaterial({
      color: 0xE0C097,
      size: 0.02,
      transparent: true,
      opacity: 0.6
    })
    
    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }
  
  onMouseMove(event) {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1
  }
  
  onResize() {
    this.width = this.container.clientWidth
    this.height = this.container.clientHeight
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
  }
  
  animate() {
    requestAnimationFrame(() => this.animate())
    
    const time = Date.now() * 0.001
    
    this.targetX += (this.mouseX * 0.5 - this.targetX) * 0.05
    this.targetY += (this.mouseY * 0.5 - this.targetY) * 0.05
    
    this.camera.position.x += (this.targetX - this.camera.position.x) * 0.05
    this.camera.position.y += (this.targetY - this.camera.position.y) * 0.05
    this.camera.lookAt(this.scene.position)
    
    this.beans?.forEach((bean) => {
      bean.mesh.rotation.x += bean.rotationSpeed.x
      bean.mesh.rotation.y += bean.rotationSpeed.y
      bean.mesh.rotation.z += bean.rotationSpeed.z
      bean.mesh.position.y += Math.sin(time * bean.floatSpeed + bean.floatOffset) * 0.002
    })
    
    this.particles.rotation.y += 0.0005
    this.particles.rotation.x += 0.0002
    
    this.renderer.render(this.scene, this.camera)
  }
}

// Product Card Glow Effect
class ProductGlow {
  constructor(card) {
    this.card = card
    this.glow = document.createElement('div')
    this.glow.className = 'product-glow'
    card.appendChild(this.glow)
    
    card.addEventListener('mousemove', (e) => this.onMouseMove(e))
    card.addEventListener('mouseleave', () => this.onMouseLeave())
  }
  
  onMouseMove(e) {
    const rect = this.card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    this.glow.style.setProperty('--mouse-x', `${x}px`)
    this.glow.style.setProperty('--mouse-y', `${y}px`)
    this.glow.classList.add('active')
  }
  
  onMouseLeave() {
    this.glow.classList.remove('active')
  }
}

// 3D Tilt Effect
class TiltEffect {
  constructor(element) {
    this.element = element
    
    if (window.matchMedia('(hover: none)').matches) return
    
    this.element.addEventListener('mousemove', (e) => this.onMouseMove(e))
    this.element.addEventListener('mouseleave', () => this.onMouseLeave())
  }
  
  onMouseMove(e) {
    const rect = this.element.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = (y - centerY) / centerY * 10
    const rotateY = (centerX - x) / centerX * 10
    
    gsap.to(this.element, {
      rotationX: rotateX,
      rotationY: rotateY,
      duration: 0.5,
      ease: 'power2.out'
    })
  }
  
  onMouseLeave() {
    gsap.to(this.element, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.5,
      ease: 'power2.out'
    })
  }
}

// =====================
// LOADING SCREEN
// =====================
function hideLoadingScreen() {
  const loadingScreen = document.querySelector('.loading-screen')
  
  gsap.to(loadingScreen, {
    opacity: 0,
    duration: 1,
    ease: 'power2.inOut',
    onComplete: () => {
      loadingScreen.style.display = 'none'
    }
  })
}

function initLoadingProgress() {
  const progress = document.querySelector('.loading-progress')
  if (progress) {
    let width = 0
    const interval = setInterval(() => {
      width += Math.random() * 25
      if (width >= 100) {
        width = 100
        clearInterval(interval)
      }
      progress.style.width = width + '%'
    }, 200)
  }
}

// =====================
// MOBILE MENU
// =====================
function openMobileMenu() {
  const menu = document.getElementById('mobile-menu')
  const drawer = menu?.querySelector('.menu-drawer')
  const overlay = menu?.querySelector('.menu-overlay')
  if (menu && drawer) {
    menu.classList.remove('pointer-events-none')
    overlay?.classList.remove('opacity-0')
    drawer.classList.remove('translate-x-full')
    drawer.classList.add('translate-x-0')
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu')
  const drawer = menu?.querySelector('.menu-drawer')
  const overlay = menu?.querySelector('.menu-overlay')
  if (menu && drawer) {
    menu.classList.add('pointer-events-none')
    overlay?.classList.add('opacity-0')
    drawer.classList.add('translate-x-full')
    drawer.classList.remove('translate-x-0')
  }
}

window.openMobileMenu = openMobileMenu
window.closeMobileMenu = closeMobileMenu

// =====================
// GALLERY MODAL
// =====================
const galleryImages = [
  'https://images.unsplash.com/photo-1501339847302-9a4b87030454?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=800&fit=crop'
]
let currentGalleryIndex = 0

function openGallery(index) {
  currentGalleryIndex = index
  const modal = document.getElementById('gallery-modal')
  const img = document.getElementById('gallery-image')
  if (modal && img) {
    img.src = galleryImages[index]
    modal.classList.remove('hidden')
    modal.classList.add('flex')
  }
}

function closeGallery() {
  const modal = document.getElementById('gallery-modal')
  if (modal) {
    modal.classList.add('hidden')
    modal.classList.remove('flex')
  }
}

function nextGallery() {
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length
  const img = document.getElementById('gallery-image')
  if (img) img.src = galleryImages[currentGalleryIndex]
}

function prevGallery() {
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length
  const img = document.getElementById('gallery-image')
  if (img) img.src = galleryImages[currentGalleryIndex]
}

window.openGallery = openGallery
window.closeGallery = closeGallery
window.nextGallery = nextGallery
window.prevGallery = prevGallery

// =====================
// MENU FILTER
// =====================
function filterMenu(category) {
  const cards = document.querySelectorAll('#menu-grid > div')
  const buttons = document.querySelectorAll('.menu-filter')
  
  buttons.forEach(btn => {
    btn.classList.remove('bg-espresso-900', 'text-latte-300')
    btn.classList.add('bg-lattee-200', 'dark:bg-espresso-800', 'text-espresso-900', 'dark:text-latte-300')
  })
  
  const activeBtn = document.querySelector('.menu-filter.active')
  if (activeBtn) {
    activeBtn.classList.remove('bg-lattee-200', 'dark:bg-espresso-800', 'text-espresso-900', 'dark:text-latte-300')
    activeBtn.classList.add('bg-espresso-900', 'text-latte-300')
  }
  
  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.classList.remove('hidden')
      card.classList.add('block')
      gsap.fromTo(card, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3 }
      )
    } else {
      card.classList.add('hidden')
      card.classList.remove('block')
    }
  })
}

window.filterMenu = filterMenu

// =====================
// TESTIMONIAL SLIDER
// =====================
class TestimonialSlider {
  constructor() {
    this.slides = document.querySelectorAll('.testimonial-slide')
    this.currentIndex = 0
    this.autoPlayInterval = null
    
    if (this.slides.length === 0) return
    
    this.init()
  }
  
  init() {
    this.showSlide(0)
    this.startAutoPlay()
    
    // Navigation buttons
    const nextBtn = document.getElementById('testimonial-next')
    const prevBtn = document.getElementById('testimonial-prev')
    
    nextBtn?.addEventListener('click', () => this.next())
    prevBtn?.addEventListener('click', () => this.prev())
  }
  
  showSlide(index) {
    this.slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev')
      if (i === index) {
        slide.classList.add('active')
      } else if (i < index) {
        slide.classList.add('prev')
      }
    })
    this.currentIndex = index
  }
  
  next() {
    const nextIndex = (this.currentIndex + 1) % this.slides.length
    this.showSlide(nextIndex)
  }
  
  prev() {
    const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length
    this.showSlide(prevIndex)
  }
  
  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => this.next(), 5000)
  }
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval)
    }
  }
}

// =====================
// RESERVATION FORM
// =====================
function submitReservation(e) {
  e.preventDefault()
  alert('Terima kasih! Reservasi Anda akan kami konfirmasi via WhatsApp.')
}

window.submitReservation = submitReservation

// =====================
// NEWSLETTER
// =====================
function subscribeNewsletter(e) {
  e.preventDefault()
  const input = e.target.querySelector('input')
  if (input && input.value) {
    alert('Terima kasih telah subscribe! Anda akan menerima promo terbaru.')
    input.value = ''
  }
}

window.subscribeNewsletter = subscribeNewsletter

// =====================
// INFINITE MARQUEE
// =====================
function initMarquee() {
  const marqueeContent = document.querySelector('.marquee-content')
  if (marqueeContent) {
    const original = marqueeContent.innerHTML
    marqueeContent.innerHTML = original + original
  }
}

// =====================
// MAIN INITIALIZATION
// =====================
document.addEventListener('DOMContentLoaded', () => {
  // Loading
  initLoadingProgress()
  setTimeout(() => hideLoadingScreen(), 2500)
  
  // Custom cursor
  new CustomCursor()
  
  // Scroll animations
  setupScrollReveal()
  setupStatsCounter()
  setupStickyHeader()
  setupDarkMode()
  initMarquee()
  
  // 3D scene
  const hero3D = document.getElementById('hero-3d')
  if (hero3D) {
    new CoffeeScene(hero3D)
  }
  
  // Magnetic buttons
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    new MagneticButton(btn)
  })
  
  // Product glow cards
  document.querySelectorAll('.gradient-card').forEach(card => {
    new ProductGlow(card)
  })
  
  // Tilt effects
  document.querySelectorAll('.tilt-element').forEach(el => {
    new TiltEffect(el)
  })
  
  // Split text
  document.querySelectorAll('.split-text').forEach(el => {
    new SplitText(el)
  })
  
  // Click ripple
  document.addEventListener('click', (e) => {
    createRipple(e.clientX, e.clientY)
  })
  
  // Testimonial slider
  new TestimonialSlider()
  
  // Hero animations
  gsap.from('.hero-title .char', {
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.05,
    ease: 'power4.out',
    delay: 0.5
  })
  
  gsap.from('.hero-subtitle', {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 1.2
  })
  
  gsap.from('.hero-cta', {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 1.5
  })
  
  // Parallax
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset
    document.querySelectorAll('.parallax-bg').forEach(el => {
      el.style.transform = `translateY(${scrolled * 0.5}px)`
    })
  })
})

// Make GSAP available globally
window.gsap = gsap
window.THREE = THREE