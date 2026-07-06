import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PlayerProvider } from './context/PlayerContext'
import { QuestProvider } from './context/QuestContext'
import { CampaignProvider } from './context/CampaignContext'
import { CourseProvider } from './context/CourseContext'
import { TimerProvider } from './context/TimerContext'
import { SkillProvider } from './context/SkillContext'
import { AchievementProvider } from './context/AchievementContext'
import { ScheduleProvider } from './context/ScheduleContext'
import { ShopProvider } from './context/ShopContext'
import { ThemeProvider } from './context/ThemeContext'
import { MediaProvider } from './context/MediaContext'
import { VaultProvider } from './context/VaultContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlayerProvider>
      <QuestProvider>
        <CampaignProvider>
          <CourseProvider>
            <TimerProvider>
              <SkillProvider>
                <AchievementProvider>
                  <ScheduleProvider>
                    <ShopProvider>
                      <ThemeProvider>
                        <MediaProvider>
                          <VaultProvider>
                            <App />
                          </VaultProvider>
                        </MediaProvider>
                      </ThemeProvider>
                    </ShopProvider>
                  </ScheduleProvider>
                </AchievementProvider>
              </SkillProvider>
            </TimerProvider>
          </CourseProvider>
        </CampaignProvider>
      </QuestProvider>
    </PlayerProvider>
  </StrictMode>,
)
