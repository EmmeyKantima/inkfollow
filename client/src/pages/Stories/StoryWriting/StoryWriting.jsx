
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BookOpen,
  ChevronDown,
  Save,
  PanelRightOpen,
  X,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react';

import API_URL from '../../../api/api';
import './StoryWriting.css';

function StoryWriting() {
  var { storyId } = useParams();

  var [acts, setActs] = useState([]);
  var [chapters, setChapters] = useState([]);
  var [selectedChapter, setSelectedChapter] = useState(null);

  var [content, setContent] = useState('');
  var [chapterTitle, setChapterTitle] = useState('');

  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);
  var [saveMessage, setSaveMessage] = useState('');

  var [showChapterMenu, setShowChapterMenu] = useState(false);
  var [showGuide, setShowGuide] = useState(false);

  var [guideEvents, setGuideEvents] = useState([]);
  var [guideScenes, setGuideScenes] = useState([]);

  var [showCheckPanel, setShowCheckPanel] = useState(false);
  var [checkTab, setCheckTab] = useState('manual');
  var [manualChecks, setManualChecks] = useState([]);
  var [aiResult, setAiResult] = useState(null);
  var [checkLoading, setCheckLoading] = useState(false);
  var [checkSaving, setCheckSaving] = useState(false);
  var [aiChecking, setAiChecking] = useState(false);
  var [checkError, setCheckError] = useState('');
  var [checkMessage, setCheckMessage] = useState('');

  var editorRef = useRef(null);
  var statusUpdatingRef = useRef(false);

  var token = localStorage.getItem('inkspireToken');

  useEffect(
    function () {
      loadChapters();
    },
    [storyId]
  );

  useEffect(function () {
        function handleEscape(event) {
            if (event.key === 'Escape') {
                setShowCheckPanel(false);
                setShowGuide(false);
                setShowChapterMenu(false);
            }
        }

        window.addEventListener('keydown', handleEscape);

        return function () {
            window.removeEventListener('keydown', handleEscape);
        };
  }, []);

  async function loadChapters() {
    try {
      setLoading(true);

      var headers = {
        Authorization: 'Bearer ' + token,
      };

      var actResponse = await fetch(
        API_URL + '/acts/story/' + storyId,
        { headers: headers }
      );

      var actData = await actResponse.json();

      if (!actResponse.ok) {
        throw new Error(actData.message || 'Failed to load Acts.');
      }

      setActs(actData);

      var allChapters = [];

      if (actData.length > 0) {
        var chapterRequests = actData.map(function (act) {
          return fetch(
            API_URL + '/chapters/act/' + act._id,
            { headers: headers }
          ).then(function (response) {
            return response.json();
          });
        });

        var chapterResults = await Promise.all(chapterRequests);

        chapterResults.forEach(function (items) {
          if (Array.isArray(items)) {
            allChapters = allChapters.concat(items);
          }
        });
      }

      allChapters = allChapters.map(function (chapter) {
        return {
          ...chapter,
          status: chapter.status || 'not_started',
        };
      });

      setChapters(allChapters);
    } catch (error) {
      console.error('Load chapters error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function selectChapter(chapter) {
    setSelectedChapter(chapter);
    setChapterTitle(chapter.title || '');
    setShowChapterMenu(false);
    setSaveMessage('');
    setShowCheckPanel(false);
    setManualChecks([]);
    setAiResult(null);

    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }

    try {
      var response = await fetch(
        API_URL + '/drafts/chapter/' + chapter._id,
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      var data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load draft.');
      }

      var draftContent = data.content || '';

      setContent(draftContent);

      if (editorRef.current) {
        editorRef.current.innerHTML = draftContent;
      }
    } catch (error) {
      console.error('Load draft error:', error);
      setContent('');

      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }

    await loadGuide(chapter._id);
    await loadChapterChecks(chapter._id);
  }

  async function loadGuide(chapterId) {
    try {
      var headers = {
        Authorization: 'Bearer ' + token,
      };

      var eventResponse = await fetch(
        API_URL + '/events/chapter/' + chapterId,
        { headers: headers }
      );

      if (!eventResponse.ok) {
        setGuideEvents([]);
        setGuideScenes([]);
        return;
      }

      var eventData = await eventResponse.json();

      var events = Array.isArray(eventData)
        ? eventData
        : eventData.events || [];

      var allScenes = [];

      if (events.length > 0) {
        var sceneRequests = events.map(function (event) {
          return fetch(
            API_URL + '/scenes/event/' + event._id,
            { headers: headers }
          ).then(async function (response) {
            if (!response.ok) return [];
            var data = await response.json();
            return Array.isArray(data) ? data : [];
          });
        });

        var sceneResults = await Promise.all(sceneRequests);

        sceneResults.forEach(function (items) {
          allScenes = allScenes.concat(items);
        });
      }

      setGuideEvents(events);
      setGuideScenes(allScenes);
    } catch (error) {
      console.error('Load guide error:', error);
      setGuideEvents([]);
      setGuideScenes([]);
    }
  }

  function getActForChapter(chapter) {
    if (!chapter) return null;

    return acts.find(function (act) {
      return act._id === chapter.actId;
    });
  }

  function getStatus(chapter) {
    return chapter.status || 'not_started';
  }

  function getStatusClass(chapter) {
    var status = getStatus(chapter);

    if (status === 'completed') {
      return 'status-dot completed';
    }

    if (status === 'in_progress') {
      return 'status-dot in-progress';
    }

    return 'status-dot not-started';
  }

  function handleEditorInput(event) {
    var newContent = event.currentTarget.innerHTML;

    setContent(newContent);

    if (
      selectedChapter &&
      getStatus(selectedChapter) === 'not_started' &&
      newContent.replace(/<[^>]*>/g, '').trim()
    ) {
      if (!statusUpdatingRef.current) {
        statusUpdatingRef.current = true;

        updateChapterStatus(
          selectedChapter._id,
          'in_progress'
        ).finally(function () {
          statusUpdatingRef.current = false;
        });
      }
    }
  }

  function format(command, value) {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false, value || null);
    setContent(editorRef.current.innerHTML);
  }

  function handleHeadingChange(event) {
    var value = event.target.value;

    if (!value) return;

    format('formatBlock', value);
    event.target.value = '';
  }

  function handleEditorKeyDown(event) {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 's'
    ) {
      event.preventDefault();
      saveDraft();
    }
  }

  async function saveDraft() {
    if (!selectedChapter) return;

    setSaving(true);
    setSaveMessage('');

    try {
      var currentContent = editorRef.current
        ? editorRef.current.innerHTML
        : content;

      var response = await fetch(
        API_URL + '/drafts/chapter/' + selectedChapter._id,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            storyId: storyId,
            title: chapterTitle,
            content: currentContent,
          }),
        }
      );

      var data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save draft.');
      }

      setContent(currentContent);
      setSaveMessage('Saved');
    } catch (error) {
      console.error('Save draft error:', error);
      setSaveMessage('Save failed');
    } finally {
      setSaving(false);

      setTimeout(function () {
        setSaveMessage('');
      }, 2500);
    }
  }

  async function updateChapterStatus(chapterId, status) {
    var previousChapter = chapters.find(function (chapter) {
      return chapter._id === chapterId;
    });

    var previousStatus = previousChapter
      ? getStatus(previousChapter)
      : 'not_started';

    setChapters(function (currentChapters) {
      return currentChapters.map(function (chapter) {
        if (chapter._id === chapterId) {
          return { ...chapter, status: status };
        }

        return chapter;
      });
    });

    setSelectedChapter(function (currentChapter) {
      if (currentChapter && currentChapter._id === chapterId) {
        return { ...currentChapter, status: status };
      }

      return currentChapter;
    });

    try {
      var response = await fetch(
        API_URL + '/chapters/' + chapterId,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({ status: status }),
        }
      );

      var data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update chapter status.'
        );
      }
    } catch (error) {
      console.error('Update chapter status error:', error);

      setChapters(function (currentChapters) {
        return currentChapters.map(function (chapter) {
          if (chapter._id === chapterId) {
            return { ...chapter, status: previousStatus };
          }

          return chapter;
        });
      });

      setSelectedChapter(function (currentChapter) {
        if (currentChapter && currentChapter._id === chapterId) {
          return { ...currentChapter, status: previousStatus };
        }

        return currentChapter;
      });
    }
  }

  function handleCompleteToggle() {
    if (!selectedChapter) return;

    var currentStatus = getStatus(selectedChapter);

    if (currentStatus === 'completed') {
      updateChapterStatus(selectedChapter._id, 'in_progress');
    } else {
      updateChapterStatus(selectedChapter._id, 'completed');
    }
  }

  function getScenesForEvent(eventId) {
    return guideScenes.filter(function (scene) {
      return scene.eventId === eventId;
    });
  }

  async function loadChapterChecks(chapterId) {
    setCheckLoading(true);
    setCheckError('');
    setCheckMessage('');

    try {
      var response = await fetch(
        API_URL + '/story-check/' + storyId + '/chapter/' + chapterId,
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      var data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load Chapter Check.');
      }

      setManualChecks(data.manualChecks || []);
      setAiResult(data.lastAiCheck || null);
    } catch (error) {
      console.error('Load chapter checks error:', error);
      setCheckError(error.message || 'Failed to load Chapter Check.');
    } finally {
      setCheckLoading(false);
    }
  }

  async function openChapterCheck() {
    if (!selectedChapter || checkLoading) return;

    setShowCheckPanel(true);
    setCheckError('');
    setCheckMessage('');

    try {
      var currentContent = editorRef.current
        ? editorRef.current.innerHTML
        : content;

      // SAVE THE LATEST DRAFT
      var saveResponse = await fetch(
        API_URL + '/drafts/chapter/' + selectedChapter._id,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            storyId: storyId,
            title: chapterTitle,
            content: currentContent,
          }),
        }
      );

      var saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveData.message || 'Failed to save the latest draft.'
        );
      }

      setContent(currentContent);

      // REFRESH THE LATEST EVENTS AND SCENES
      await loadGuide(selectedChapter._id);

      // REFRESH THE CHECKLIST
      await loadChapterChecks(selectedChapter._id);
    } catch (error) {
      setCheckError(error.message || 'Failed to refresh checklist.');
    }
  }

  function toggleManualCheck(id) {
    setManualChecks(function (current) {
      return current.map(function (item) {
        return item.id === id
          ? { ...item, completed: !item.completed }
          : item;
      });
    });

    setCheckMessage('');
  }

  async function saveChapterChecks() {
    if (!selectedChapter) return;

    setCheckSaving(true);
    setCheckError('');
    setCheckMessage('');

    try {
      var response = await fetch(
        API_URL +
          '/story-check/' +
          storyId +
          '/chapter/' +
          selectedChapter._id +
          '/manual',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            manualChecks: manualChecks,
          }),
        }
      );

      var data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save checklist.');
      }

      setManualChecks(data.manualChecks || []);
      setCheckMessage('Checklist saved.');
    } catch (error) {
      setCheckError(error.message || 'Failed to save checklist.');
    } finally {
      setCheckSaving(false);
    }
  }

  async function runChapterAiCheck() {
    if (!selectedChapter || aiChecking) return;

    setAiChecking(true);
    setCheckError('');
    setCheckMessage('');

    try {
      var currentContent = editorRef.current
        ? editorRef.current.innerHTML
        : content;

      var saveResponse = await fetch(
        API_URL + '/drafts/chapter/' + selectedChapter._id,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            storyId: storyId,
            title: chapterTitle,
            content: currentContent,
          }),
        }
      );

      var saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveData.message || 'Could not save the draft before checking.'
        );
      }

      setContent(currentContent);

      var response = await fetch(
        API_URL +
          '/story-check/' +
          storyId +
          '/chapter/' +
          selectedChapter._id +
          '/ai',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({}),
        }
      );

      var data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'AI Check failed.');
      }

      setAiResult(data);
      setCheckMessage('Chapter check completed.');
    } catch (error) {
      setCheckError(error.message || 'AI Check failed.');
    } finally {
      setAiChecking(false);
    }
  }

  if (loading) {
    return (
      <div className="writing-page">
        <p className="writing-loading">Loading Writing...</p>
      </div>
    );
  }

  if (!selectedChapter) {
    return (
      <div className="writing-page">
        <div className="writing-header">
          <div className="writing-header-left">
            <p className="writing-eyebrow">WRITING</p>
            <h1>Your Chapters</h1>
            <p className="writing-description">
              Choose a chapter to continue writing your story.
            </p>
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="writing-empty">
            <BookOpen size={28} />
            <h2>No chapters yet</h2>
            <p>
              Create a chapter in Story Builder before starting to write.
            </p>
          </div>
        ) : (
          <div className="chapter-list">
            <div className="chapter-list-header">
              <span>CHAPTER</span>
              <span>ACT</span>
            </div>

            {chapters.map(function (chapter) {
              var act = getActForChapter(chapter);

              return (
                <button
                  key={chapter._id}
                  type="button"
                  className="chapter-list-row"
                  onClick={function () {
                    selectChapter(chapter);
                  }}
                >
                  <div className="chapter-list-title">
                    <span className={getStatusClass(chapter)} />
                    <strong>{chapter.title}</strong>
                  </div>

                  <span className="chapter-list-act">
                    {act ? act.title : '—'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  var currentAct = getActForChapter(selectedChapter);

  return (
    <div className="writing-page">
      <div className="writing-header">
        <div className="writing-header-left">
          <p className="writing-eyebrow">WRITING</p>
          <h1>{selectedChapter.title}</h1>
          <p className="writing-description">
            Write your story continuously while keeping your story plan nearby.
          </p>
        </div>

        <div className="writing-header-actions">
          {saveMessage && (
            <span
              className={
                saveMessage === 'Saved'
                  ? 'save-message saved'
                  : 'save-message error'
              }
            >
              {saveMessage}
            </span>
          )}

          <button
            type="button"
            className="story-check-open-button"
            onClick={openChapterCheck}
            disabled={!selectedChapter}
          >
            <Sparkles size={17} />
            Check Chapter
          </button>

          <button
            className="story-guide-button"
            type="button"
            onClick={function () {
              setShowGuide(true);
            }}
          >
            <PanelRightOpen size={17} />
            Story Guide
          </button>

          <button
            className="save-draft-button"
            type="button"
            onClick={saveDraft}
            disabled={saving || !selectedChapter}
          >
            <Save size={17} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="chapter-selector">
        <button
          className="chapter-selector-button"
          type="button"
          onClick={function () {
            setShowChapterMenu(!showChapterMenu);
          }}
        >
          <div className="chapter-selector-info">
            <span>CURRENT CHAPTER</span>
            <strong>
              <span className={getStatusClass(selectedChapter)} />
              {selectedChapter.title}
            </strong>
          </div>

          <ChevronDown size={18} />
        </button>

        {showChapterMenu && (
          <div className="chapter-menu">
            {chapters.map(function (chapter) {
              var act = getActForChapter(chapter);

              return (
                <button
                  key={chapter._id}
                  type="button"
                  className={
                    selectedChapter &&
                    selectedChapter._id === chapter._id
                      ? 'chapter-menu-item active'
                      : 'chapter-menu-item'
                  }
                  onClick={function () {
                    selectChapter(chapter);
                  }}
                >
                  <span className={getStatusClass(chapter)} />

                  <span className="chapter-menu-text">
                    {act ? act.title + ' — ' : ''}
                    {chapter.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="writing-status-row">
        <div className="writing-current-status">
          <span className={getStatusClass(selectedChapter)} />
          <span>
            {getStatus(selectedChapter) === 'completed'
              ? 'Completed'
              : getStatus(selectedChapter) === 'in_progress'
                ? 'In Progress'
                : 'Not Started'}
          </span>
        </div>

        <button
          type="button"
          className={
            getStatus(selectedChapter) === 'completed'
              ? 'chapter-complete-button completed'
              : 'chapter-complete-button'
          }
          onClick={handleCompleteToggle}
        >
          <Check size={16} />
          {getStatus(selectedChapter) === 'completed'
            ? 'Mark as In Progress'
            : 'Mark as Complete'}
        </button>
      </div>

      <div
        className={
          showCheckPanel
            ? 'writing-workspace with-check-panel'
            : 'writing-workspace'
        }
      >
        <div className="writing-editor-container">
          <div className="writing-toolbar">
            <select
              className="heading-select"
              defaultValue=""
              onChange={handleHeadingChange}
              title="Heading"
            >
              <option value="" disabled>Heading</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="p">Normal</option>
            </select>

            <span className="toolbar-divider" />

            <button
              type="button"
              onMouseDown={function (event) {
                event.preventDefault();
                format('bold');
              }}
              title="Bold"
            >
              <strong>B</strong>
            </button>

            <button
              type="button"
              onMouseDown={function (event) {
                event.preventDefault();
                format('italic');
              }}
              title="Italic"
            >
              <em>I</em>
            </button>

            <button
              type="button"
              onMouseDown={function (event) {
                event.preventDefault();
                format('underline');
              }}
              title="Underline"
            >
              <u>U</u>
            </button>

            <span className="toolbar-divider" />

            <button
              type="button"
              onMouseDown={function (event) {
                event.preventDefault();
                format('insertUnorderedList');
              }}
              title="Bullet List"
            >
              <List size={17} />
            </button>

            <button
              type="button"
              onMouseDown={function (event) {
                event.preventDefault();
                format('insertOrderedList');
              }}
              title="Numbered List"
            >
              <ListOrdered size={17} />
            </button>

            <span className="toolbar-divider" />

            <button
              type="button"
              onMouseDown={function (event) {
                event.preventDefault();
                format('justifyLeft');
              }}
              title="Align Left"
            >
              <AlignLeft size={17} />
            </button>

            <button
              type="button"
              onMouseDown={function (event) {
                event.preventDefault();
                format('justifyCenter');
              }}
              title="Align Center"
            >
              <AlignCenter size={17} />
            </button>

            <button
              type="button"
              onMouseDown={function (event) {
                event.preventDefault();
                format('justifyRight');
              }}
              title="Align Right"
            >
              <AlignRight size={17} />
            </button>
          </div>

          <div
            ref={editorRef}
            className="writing-editor"
            contentEditable="true"
            suppressContentEditableWarning={true}
            onInput={handleEditorInput}
            onKeyDown={handleEditorKeyDown}
            data-placeholder="Start writing your story..."
          />
        </div>

        {showCheckPanel && (
          <div
            className="chapter-check-overlay"
            onClick={function () {
              setShowCheckPanel(false);
            }}
          >
            <aside
              className="chapter-check-panel"
              onClick={function (event) {
                event.stopPropagation();
              }}
            >
              <div className="chapter-check-header">
                <div>
                  <p>CHAPTER REVIEW</p>
                  <h2>Check Chapter</h2>
                  <span>{selectedChapter.title}</span>
                </div>

                <button
                  type="button"
                  className="chapter-check-close"
                  onClick={function () {
                    setShowCheckPanel(false);
                  }}
                  title="Close Chapter Check"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="chapter-check-tabs">
                <button
                  type="button"
                  className={checkTab === 'manual' ? 'active' : ''}
                  onClick={function () {
                    setCheckTab('manual');
                  }}
                >
                  Manual Check
                </button>

                <button
                  type="button"
                  className={checkTab === 'ai' ? 'active' : ''}
                  onClick={function () {
                    setCheckTab('ai');
                  }}
                >
                  <Sparkles size={15} />
                  AI Check
                </button>
              </div>

              {checkError && (
                <div className="chapter-check-error">
                  <AlertCircle size={17} />
                  <span>{checkError}</span>
                </div>
              )}

              {checkMessage && (
                <div className="chapter-check-success">
                  <CheckCircle2 size={17} />
                  <span>{checkMessage}</span>
                </div>
              )}

              {checkLoading ? (
                <div className="chapter-check-loading">
                  <LoaderCircle
                    size={20}
                    className="chapter-check-spinner"
                  />
                  Loading checks...
                </div>
              ) : checkTab === 'manual' ? (
                <div className="chapter-check-content">
                  <p className="chapter-check-description">
                    Review the characters and planned events or scenes for this chapter.
                  </p>

                  <section className="chapter-check-group">
                    <h3>Characters</h3>

                    {manualChecks.filter(function (item) {
                      return item.category === 'Characters';
                    }).length === 0 ? (
                      <p className="chapter-check-empty">
                        No matching characters were found in this chapter.
                      </p>
                    ) : (
                      manualChecks
                        .filter(function (item) {
                          return item.category === 'Characters';
                        })
                        .map(function (item) {
                          return (
                            <label
                              className="chapter-check-item"
                              key={item.id}
                            >
                              <input
                                type="checkbox"
                                checked={!!item.completed}
                                onChange={function () {
                                  toggleManualCheck(item.id);
                                }}
                              />
                              <span>
                                <strong>{item.label}</strong>
                                <small>{item.description}</small>
                              </span>
                            </label>
                          );
                        })
                    )}
                  </section>

                  <section className="chapter-check-group">
                    <h3>Story Structure</h3>

                    {guideEvents.length === 0 ? (
                      <p className="chapter-check-empty">
                        No events planned for this chapter yet.
                      </p>
                    ) : (
                      guideEvents.map(function (event, eventIndex) {
                        var eventCheck = manualChecks.find(function (item) {
                          return item.id === 'event:' + event._id;
                        });

                        var eventScenes = getScenesForEvent(event._id);

                        return (
                          <div className="check-event-group" key={event._id}>
                            <label className="chapter-check-item check-event-item">
                              <div className="check-event-heading">
                                <strong>
                                    Event {eventIndex + 1}: {event.title || 'Untitled event'}
                                </strong>

                                {event.description && (
                                    <small>{event.description}</small>
                                )}
                              </div>
                            </label>

                            {eventScenes.map(function (scene, sceneIndex) {
                              var sceneCheck = manualChecks.find(function (item) {
                                return item.id === 'scene:' + scene._id;
                              });

                              return (
                                <label
                                  className="chapter-check-item check-scene-item"
                                  key={scene._id}
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!(sceneCheck && sceneCheck.completed)}
                                    onChange={function () {
                                      toggleManualCheck('scene:' + scene._id);
                                    }}
                                  />
                                  <span>
                                    <strong>
                                      Scene {sceneIndex + 1}: {scene.title}
                                    </strong>
                                    {scene.description && (
                                      <small>{scene.description}</small>
                                    )}
                                  </span>
                                </label>
                              );
                            })}

                            {eventScenes.length === 0 && (
                              <p className="check-no-scenes">
                                No scenes in this event yet.
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </section>

                  <button
                    type="button"
                    className="chapter-check-save"
                    onClick={saveChapterChecks}
                    disabled={checkSaving}
                  >
                    <Save size={16} />
                    {checkSaving ? 'Saving...' : 'Save Checklist'}
                  </button>
                </div>
              ) : (
                <div className="chapter-check-content">
                  <div className="chapter-ai-intro">
                    <Sparkles size={22} />
                    <h3>AI Chapter Review</h3>
                    <p>
                      Review this chapter against its character profiles and planned events/scenes.
                      Your draft will be saved before checking.
                    </p>
                    <p>
                      AI findings are suggestions for you to review. They will not edit your draft automatically.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="chapter-check-save"
                    onClick={runChapterAiCheck}
                    disabled={aiChecking}
                  >
                    {aiChecking ? (
                      <LoaderCircle
                        size={16}
                        className="chapter-check-spinner"
                      />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    {aiChecking
                      ? 'Checking Chapter...'
                      : aiResult
                        ? 'Check Again'
                        : 'Run AI Check'}
                  </button>

                  {aiResult && (
                    <div className="chapter-ai-results">
                      <p className="chapter-ai-date">
                        {aiResult.checkedAt
                          ? 'Last checked: ' +
                            new Date(aiResult.checkedAt).toLocaleString()
                          : 'Latest result'}
                      </p>

                      <p className="chapter-ai-summary">
                        {aiResult.summary}
                      </p>

                      {!aiResult.findings ||
                      aiResult.findings.length === 0 ? (
                        <div className="chapter-check-empty">
                          No potential issues were identified in the available information.
                          This does not guarantee that the chapter has no inconsistencies.
                        </div>
                      ) : (
                        aiResult.findings.map(function (finding, index) {
                          return (
                            <article
                              className="chapter-ai-finding"
                              key={index}
                            >
                              <span className="chapter-ai-category">
                                {finding.category} · {finding.severity}
                              </span>

                              <h4>{finding.title}</h4>

                              {finding.evidence && (
                                <p>
                                  <strong>Evidence</strong>
                                  {finding.evidence}
                                </p>
                              )}

                              {finding.suggestion && (
                                <p>
                                  <strong>Suggestion</strong>
                                  {finding.suggestion}
                                </p>
                              )}
                            </article>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      {showGuide && (
        <div
          className="guide-overlay"
          onClick={function () {
            setShowGuide(false);
          }}
        >
          <aside
            className="story-guide-panel"
            onClick={function (event) {
              event.stopPropagation();
            }}
          >
            <div className="guide-header">
              <div>
                <p>STORY GUIDE</p>
                <h2>Story Plan</h2>
              </div>

              <button
                type="button"
                className="guide-close-button"
                onClick={function () {
                  setShowGuide(false);
                }}
              >
                <X size={19} />
              </button>
            </div>

            <div className="guide-content">
              <div className="guide-act">
                <p className="guide-act-label">ACT</p>

                <h3>
                  {currentAct ? currentAct.title : 'Current Act'}
                </h3>

                <div className="guide-chapter">
                  <div className="guide-chapter-title">
                    <BookOpen size={16} />
                    <span>{selectedChapter.title}</span>
                  </div>

                  {guideEvents.length === 0 ? (
                    <div className="guide-empty">
                      <p>
                        No events have been planned for this chapter yet.
                      </p>
                    </div>
                  ) : (
                    guideEvents.map(function (event, eventIndex) {
                      var eventScenes = getScenesForEvent(event._id);

                      return (
                        <div className="guide-event" key={event._id}>
                          <div className="guide-event-label">
                            EVENT {eventIndex + 1}
                          </div>

                          <h4>{event.title}</h4>

                          {event.description && (
                            <p className="guide-event-description">
                              {event.description}
                            </p>
                          )}

                          {eventScenes.length > 0 && (
                            <div className="guide-scenes">
                              {eventScenes.map(function (scene, sceneIndex) {
                                return (
                                  <div
                                    className="guide-scene"
                                    key={scene._id}
                                  >
                                    <div className="guide-scene-label">
                                      SCENE {sceneIndex + 1}
                                    </div>

                                    <h5>{scene.title}</h5>

                                    {scene.description && (
                                      <p className="guide-scene-description">
                                        {scene.description}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default StoryWriting;