// src/components/WeatherParticles.jsx

import React, { useCallback, useMemo } from 'react';
import { Particles } from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

const WeatherParticles = ({ condition }) => {
  const options = useMemo(() => {
    const baseOptions = {
      fullScreen: {
        enable: true,
        zIndex: -1,
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'bubble' },
        },
        modes: {
          bubble: {
            distance: 200,
            duration: 2,
            opacity: 0.8,
            size: 6,
          },
        },
      },
      particles: {},
    };

    switch ((condition || '').toLowerCase()) {
      case 'rain':
      case 'drizzle':
        return {
          ...baseOptions,
          particles: {
            number: { value: 100, density: { enable: true, value_area: 800 } },
            color: { value: '#a0b0c0' },
            shape: { type: 'line' },
            opacity: { value: 0.5, random: true },
            size: { value: 20, random: { enable: true, minimumValue: 10 } },
            move: {
              enable: true,
              speed: 10,
              direction: 'bottom',
              straight: true,
              out_mode: 'out',
            },
          },
        };

      case 'snow':
        return {
          ...baseOptions,
          particles: {
            number: { value: 150, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: 0.7, random: true },
            size: { value: 3, random: { enable: true, minimumValue: 1 } },
            move: {
              enable: true,
              speed: 1,
              direction: 'bottom',
              random: true,
              straight: false,
              out_mode: 'out',
              bounce: false,
              attract: { enable: false, rotateX: 600, rotateY: 1200 },
            },
          },
        };

      case 'clear':
        return {
          ...baseOptions,
          particles: {
            number: { value: 0 }, // use emitter for shooting stars
            color: { value: '#ffddaa' },
            shape: { type: 'circle' },
            opacity: {
              value: 1,
              anim: { enable: true, speed: 0.5, opacity_min: 0.2, sync: false },
            },
            size: {
              value: 4,
              random: false,
              anim: { enable: true, speed: 10, size_min: 1, sync: false },
            },
            move: {
              enable: true,
              speed: 100,
              direction: 'right',
              straight: true,
              out_mode: 'destroy',
            },
            trail: {
              enable: true,
              length: 10,
              fill: { color: { value: '#ffddaa' } },
            },
          },
          emitters: [
            {
              direction: 'right',
              size: { width: 0, height: 0 },
              position: { x: -10, y: 30 },
              rate: { delay: 5, quantity: 1 },
              life: { duration: 0.1, count: 1 },
              particles: {
                move: { speed: 70, angle: 0 },
                size: { value: { min: 2, max: 5 } },
                opacity: { value: 1 },
                shape: { type: 'circle' },
                trail: {
                  enable: true,
                  length: 15,
                  fill: { color: { value: '#ffddaa' } },
                },
              },
            },
          ],
        };

      default:
        return {
          ...baseOptions,
          particles: {
            number: { value: 30, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: 0.2, random: true },
            size: { value: 100, random: { enable: true, minimumValue: 50 } },
            move: {
              enable: true,
              speed: 0.5,
              direction: 'top',
              random: true,
              straight: false,
              out_mode: 'out',
            },
          },
        };
    }
  }, [condition]);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  if (!options) return null;

  return <Particles init={particlesInit} options={options} />;
};

export default WeatherParticles;
