
"use client"

import { useEffect, useRef } from "react"

type EnhancedGradientProps = {
  className?: string
}

export const Gradient: React.FC<EnhancedGradientProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    let animationFrameId: number
    let time = 0

    // Particle system
    const particles: Particle[] = []
    const particleCount = 50

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor(canvas: HTMLCanvasElement) {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 5 + 1
        this.speedX = Math.random() * 3 - 1.5
        this.speedY = Math.random() * 3 - 1.5
        this.color = `hsl(${Math.random() * 60 + 30}, 70%, 70%)`
      }

      update(canvas: HTMLCanvasElement) {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas))
    }

    const drawScene = () => {
      time += 0.005
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width
      const height = canvas.height

      // Create multiple gradients that we'll blend
      const gradients = [
        ctx.createLinearGradient(0, 0, width, height),
        ctx.createLinearGradient(width, 0, 0, height),
        ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
      ]

      // Dynamic color palette
      const colors = [
        `hsl(43, ${30 + Math.sin(time) * 20}%, ${85 + Math.sin(time * 0.7) * 10}%)`,
        `hsl(30, ${40 + Math.cos(time * 1.1) * 20}%, ${75 + Math.sin(time * 0.8) * 10}%)`,
        `hsl(60, ${35 + Math.sin(time * 1.2) * 20}%, ${80 + Math.cos(time * 0.9) * 10}%)`,
        `hsl(20, ${45 + Math.cos(time * 0.9) * 20}%, ${70 + Math.sin(time * 1.1) * 10}%)`
      ]

      gradients.forEach((gradient, index) => {
        gradient.addColorStop(0, colors[index % colors.length])
        gradient.addColorStop(0.5, colors[(index + 1) % colors.length])
        gradient.addColorStop(1, colors[(index + 2) % colors.length])
      })

      // Clear the canvas
      ctx.clearRect(0, 0, width, height)

      // Draw the blended gradients
      gradients.forEach((gradient, index) => {
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time + index * Math.PI / gradients.length)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      })

      ctx.globalAlpha = 1

      // Update and draw particles
      particles.forEach(particle => {
        particle.update(canvas)
        particle.draw(ctx)
      })

      animationFrameId = requestAnimationFrame(drawScene)
    }

    drawScene()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-[200%] h-[200%]"
      />
    </div>
  )
}

export default Gradient