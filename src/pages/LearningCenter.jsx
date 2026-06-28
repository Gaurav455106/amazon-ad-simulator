import { useState } from 'react';
import { BookOpen, Play, ChevronRight, Star } from 'lucide-react';

const MODULES = [
  {
    category: 'Getting Started',
    items: [
      { title: 'Introduction to Amazon Ads', duration: '5 min', type: 'article', level: 'Beginner', completed: true },
      { title: 'Understanding Campaign Types', duration: '8 min', type: 'video', level: 'Beginner', completed: true },
      { title: 'Setting Up Your First Campaign', duration: '12 min', type: 'tutorial', level: 'Beginner', completed: false },
    ]
  },
  {
    category: 'Keyword Strategy',
    items: [
      { title: 'Match Types Explained', duration: '6 min', type: 'article', level: 'Intermediate', completed: false },
      { title: 'Keyword Research Best Practices', duration: '10 min', type: 'video', level: 'Intermediate', completed: false },
      { title: 'Negative Keywords: When and How', duration: '7 min', type: 'article', level: 'Intermediate', completed: false },
    ]
  },
  {
    category: 'Bidding & Budget',
    items: [
      { title: 'How Amazon Auction Works', duration: '9 min', type: 'video', level: 'Intermediate', completed: false },
      { title: 'Bidding Strategies Compared', duration: '11 min', type: 'article', level: 'Advanced', completed: false },
      { title: 'Budget Optimization Techniques', duration: '8 min', type: 'tutorial', level: 'Advanced', completed: false },
    ]
  },
  {
    category: 'Measurement',
    items: [
      { title: 'Understanding ACOS vs ROAS', duration: '5 min', type: 'article', level: 'Beginner', completed: false },
      { title: 'Reading Search Term Reports', duration: '7 min', type: 'tutorial', level: 'Intermediate', completed: false },
      { title: 'Attribution and Brand Metrics', duration: '10 min', type: 'video', level: 'Advanced', completed: false },
    ]
  },
];

const TYPE_COLORS = { article: '#2196f3', video: '#e47911', tutorial: '#4caf50' };
const LEVEL_COLORS = { Beginner: '#4caf50', Intermediate: '#e47911', Advanced: '#f44336' };

export default function LearningCenter() {
  const [activeModule, setActiveModule] = useState(null);
  const [search, setSearch] = useState('');

  const totalItems = MODULES.flatMap(m => m.items).length;
  const completedItems = MODULES.flatMap(m => m.items).filter(i => i.completed).length;
  const pct = Math.round(completedItems / totalItems * 100);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Learning Center</h1>
          <p className="page-subtitle">Master Amazon Advertising with guided lessons and tutorials</p>
        </div>
      </div>

      <div className="learning-progress-card">
        <div>
          <h3>Your progress</h3>
          <p>{completedItems} of {totalItems} lessons completed</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="progress-pct">{pct}%</div>
      </div>

      {MODULES.map(module => (
        <div key={module.category} className="learning-module">
          <h3 className="module-title">{module.category}</h3>
          <div className="lesson-list">
            {module.items.map(item => (
              <div key={item.title} className={`lesson-item ${item.completed ? 'completed' : ''}`} onClick={() => setActiveModule(item)}>
                <div className="lesson-icon" style={{ background: TYPE_COLORS[item.type] }}>
                  {item.type === 'video' ? <Play size={14} color="white" /> : <BookOpen size={14} color="white" />}
                </div>
                <div className="lesson-info">
                  <div className="lesson-title">{item.title}</div>
                  <div className="lesson-meta">
                    <span className="lesson-duration">{item.duration}</span>
                    <span className="lesson-type" style={{ color: TYPE_COLORS[item.type] }}>{item.type}</span>
                    <span className="lesson-level" style={{ color: LEVEL_COLORS[item.level] }}>{item.level}</span>
                  </div>
                </div>
                {item.completed && <Star size={16} color="#e47911" fill="#e47911" />}
                <ChevronRight size={16} color="#ccc" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {activeModule && (
        <div className="modal-overlay" onClick={() => setActiveModule(null)}>
          <div className="modal large-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{activeModule.title}</h2>
              <button className="modal-close" onClick={() => setActiveModule(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="lesson-content">
                <div className="lesson-video-placeholder">
                  <Play size={48} color="white" />
                  <p>{activeModule.type === 'video' ? 'Video player' : 'Interactive lesson'}</p>
                </div>
                <div className="lesson-text">
                  <p>This {activeModule.type} covers key concepts about <strong>{activeModule.title}</strong>.</p>
                  <p>Duration: {activeModule.duration} | Level: {activeModule.level}</p>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amazon Advertising provides powerful tools to help brands reach customers throughout their shopping journey. Understanding these fundamentals is essential for campaign success.</p>
                  <p>Key takeaways from this lesson:</p>
                  <ul>
                    <li>Understand the core concepts of Amazon Ads</li>
                    <li>Learn best practices for campaign setup</li>
                    <li>Know when and how to apply different strategies</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveModule(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => setActiveModule(null)}>Mark as complete ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
