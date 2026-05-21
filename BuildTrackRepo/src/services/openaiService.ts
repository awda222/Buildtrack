/**
 * OpenAI integration for BuildTrack AI Assistant
 */
import { isOpenAIConfigured } from '../config/env';
import type { Material, Project, Task } from '../types';

export interface AIContext {
  projects: Project[];
  materials: Material[];
  tasks: Task[];
}

/**
 * Send a message to the AI construction assistant
 */
export async function askAI(
  userMessage: string,
  context: AIContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);

  if (!isOpenAIConfigured()) {
    return getDemoAIResponse(userMessage, context);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content ??
      'I could not generate a response. Please try again.'
    );
  } catch (error) {
    console.error('OpenAI error:', error);
    return getDemoAIResponse(userMessage, context);
  }
}

/**
 * Build system prompt with live project context
 */
function buildSystemPrompt(context: AIContext): string {
  const { projects, materials, tasks } = context;

  const lowStock = materials.filter((m) => m.quantity < m.minThreshold);
  const delayed = tasks.filter(
    (t) =>
      t.status !== 'completed' && new Date(t.deadline) < new Date()
  );
  const inProgress = tasks.filter((t) => t.status === 'in_progress');

  return `You are BuildTrack AI, an expert construction management assistant.
You help builders, contractors, and supervisors manage projects efficiently.

CURRENT DATA:
Projects: ${JSON.stringify(projects.map((p) => ({ name: p.name, progress: p.progress, status: p.status })))}
Materials: ${JSON.stringify(materials.map((m) => ({ name: m.name, qty: m.quantity, unit: m.unit, min: m.minThreshold })))}
Tasks: ${JSON.stringify(tasks.map((t) => ({ title: t.title, status: t.status, deadline: t.deadline, progress: t.progress })))}
Low stock items: ${lowStock.map((m) => m.name).join(', ') || 'None'}
Delayed tasks: ${delayed.map((t) => t.title).join(', ') || 'None'}
In-progress tasks: ${inProgress.length}

Provide concise, actionable construction management advice. Use bullet points when listing items.
Reference actual data from the context when answering.`;
}

/**
 * Demo AI responses when OpenAI key is not configured
 */
function getDemoAIResponse(message: string, context: AIContext): string {
  const lower = message.toLowerCase();
  const { materials, tasks, projects } = context;

  if (lower.includes('cement')) {
    const cement = materials.find((m) => m.category === 'cement');
    if (cement) {
      const status =
        cement.quantity < cement.minThreshold ? '⚠️ LOW STOCK' : '✅ OK';
      return `**Cement Inventory**\n\n${cement.name}: **${cement.quantity} ${cement.unit}** remaining.\nMinimum threshold: ${cement.minThreshold} ${cement.unit}\nStatus: ${status}\n\nAt current usage (~50 bags/week), you have approximately **${Math.floor(cement.quantity / 50)} weeks** of supply.`;
    }
  }

  if (lower.includes('delayed') || lower.includes('overdue')) {
    const delayed = tasks.filter(
      (t) =>
        t.status !== 'completed' && new Date(t.deadline) < new Date()
    );
    if (delayed.length === 0) {
      return '**Delayed Tasks**\n\nNo tasks are currently past their deadline. Great job keeping on schedule!';
    }
    return `**Delayed Tasks (${delayed.length})**\n\n${delayed
      .map(
        (t) =>
          `• **${t.title}** — Due ${t.deadline}\n  Project: ${t.projectName ?? 'N/A'} | Progress: ${t.progress}%`
      )
      .join('\n\n')}\n\n**Recommendation:** Prioritize "${delayed[0].title}" and consider reassigning resources.`;
  }

  if (lower.includes('progress') || lower.includes('summary')) {
    const avgProgress =
      projects.reduce((sum, p) => sum + p.progress, 0) / (projects.length || 1);
    const active = projects.filter((p) => p.status === 'active').length;

    return `**Project Progress Summary**\n\n• Active projects: **${active}**\n• Average completion: **${Math.round(avgProgress)}%**\n\n${projects
      .map((p) => `• **${p.name}**: ${p.progress}% (${p.status})`)
      .join('\n')}\n\n**Tasks:** ${tasks.filter((t) => t.status === 'in_progress').length} in progress, ${tasks.filter((t) => t.status === 'pending').length} pending, ${tasks.filter((t) => t.status === 'completed').length} completed.`;
  }

  if (lower.includes('shortage') || lower.includes('predict') || lower.includes('inventory')) {
    const lowStock = materials.filter((m) => m.quantity < m.minThreshold);
    return `**Inventory Predictions**\n\n${lowStock.length > 0 ? lowStock.map((m) => `⚠️ **${m.name}**: ${m.quantity}/${m.minThreshold} ${m.unit} — reorder immediately`).join('\n') : 'All materials are above minimum thresholds.'}\n\n**AI Forecast:**\n• Sand may deplete in ~5 days at current rate\n• Steel reorder recommended within 48 hours\n• Electrical wire stock critical for Level 12 work`;
  }

  if (lower.includes('workflow') || lower.includes('improve') || lower.includes('suggest')) {
    return `**Workflow Improvement Suggestions**\n\n1. **Batch material deliveries** — Schedule steel and sand on the same day to reduce logistics costs.\n2. **Parallel inspections** — Run MEP and structural inspections simultaneously on Levels 12–15.\n3. **Daily standups** — 15-min supervisor sync at 7 AM to catch delays early.\n4. **Automated reorder triggers** — Set alerts at 120% of minimum threshold for critical materials.`;
  }

  return `**BuildTrack AI Assistant** (Demo Mode)\n\nI can help you with:\n• Material inventory ("How much cement is left?")\n• Task status ("Which tasks are delayed?")\n• Project summaries ("Show project progress")\n• Inventory predictions & workflow tips\n\n**Quick Stats:**\n• ${projects.length} projects | ${materials.length} materials tracked\n• ${tasks.filter((t) => t.status !== 'completed').length} open tasks\n• ${materials.filter((m) => m.quantity < m.minThreshold).length} low-stock alerts\n\n*Connect your OpenAI API key for full AI capabilities.*`;
}
