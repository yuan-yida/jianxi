# DESIGN.md

## 项目与用户画像
- 产品名：VerbFlow - 基于大模型场景扮演的英语口语训练系统
- 目标用户：儿童(6-12)、青少年(13-18)、成人(18+)，覆盖全年龄段英语学习者
- 品牌色：紫色 V 字 Logo

## Design Tokens

### Color Palette
- Primary: Indigo/Purple (#6366f1 -> #8b5cf6)
- Background: Light lavender gradient (#f0f0ff -> #f5f0ff)
- Surface: White (#ffffff) with subtle shadow
- Text: Slate-800 primary, slate-500 secondary, slate-400 muted
- Accent states: indigo (primary actions), emerald (success/score), amber (warnings), rose (errors)
- Chart colors: indigo, emerald, amber, rose, cyan

### Typography
- Font family: Inter (Latin) + Noto Sans SC (CJK), system-ui fallback
- Scale: 12px captions, 14px body, 16-18px headings, 24-32px hero

### Spacing & Radius
- Border radius: 12px (cards), 16px (large containers)
- Card padding: 20-24px
- Section spacing: 32-48px vertical

## Visual Direction
- Light mode, clean white cards on soft lavender gradient background
- Subtle box-shadow on cards (no glassmorphism)
- Purple/indigo accent on CTAs and active nav items
- Charts with soft filled areas and smooth lines
- Minimal, clean layout with generous whitespace

## Interaction Patterns
- Smooth page transitions
- Hover states: subtle shadow increase + border color shift
- Active nav: purple underline indicator
- Score animations: smooth counter transitions
