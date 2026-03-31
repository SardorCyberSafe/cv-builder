(function() {
    'use strict';

    let currentLang = localStorage.getItem('cv_lang') || 'uz';
    let currentTemplate = localStorage.getItem('cv_template') || 'simple';
    let experienceCount = 0;
    let educationCount = 0;
    let languageCount = 0;
    let projectCount = 0;

    function t(key) {
        return translations[currentLang][key] || key;
    }

    function init() {
        setupEventListeners();
        loadFromStorage();
        applyLanguage();
        updatePreview();
    }

    function setupEventListeners() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentLang = btn.dataset.lang;
                localStorage.setItem('cv_lang', currentLang);
                applyLanguage();
                updatePreview();
            });
        });

        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTemplate = btn.dataset.template;
                localStorage.setItem('cv_template', currentTemplate);
                updatePreview();
            });
        });

        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.add;
                addDynamicEntry(type);
            });
        });

        document.getElementById('cvForm').addEventListener('input', () => {
            saveToStorage();
            updatePreview();
        });

        document.getElementById('downloadPdf').addEventListener('click', downloadPdf);
        document.getElementById('clearForm').addEventListener('click', clearForm);

        const activeLang = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
        if (activeLang) {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            activeLang.classList.add('active');
        }

        const activeTemplate = document.querySelector(`.template-btn[data-template="${currentTemplate}"]`);
        if (activeTemplate) {
            document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
            activeTemplate.classList.add('active');
        }
    }

    function applyLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) {
                el.textContent = translations[currentLang][key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[currentLang][key]) {
                el.placeholder = translations[currentLang][key];
            }
        });

        document.querySelectorAll('.dynamic-entry select[name*="level"]').forEach(select => {
            const currentVal = select.value;
            select.innerHTML = '';
            ['native', 'fluent', 'intermediate', 'basic'].forEach(level => {
                const opt = document.createElement('option');
                opt.value = level;
                opt.textContent = t(level);
                if (level === currentVal) opt.selected = true;
                select.appendChild(opt);
            });
        });
    }

    function addDynamicEntry(type, data = {}) {
        const container = document.getElementById(type + 'List');
        if (!container) return;

        let html = '';

        switch (type) {
            case 'experience':
                experienceCount++;
                const expId = experienceCount;
                html = `
                    <div class="dynamic-entry" data-type="experience" data-id="${expId}">
                        <button type="button" class="remove-btn" onclick="removeEntry(this)" title="${t('remove')}">${t('remove')}</button>
                        <div class="form-row">
                            <div class="form-group">
                                <label>${t('company')}</label>
                                <input type="text" name="exp_company_${expId}" value="${data.company || ''}" placeholder="${t('company')}">
                            </div>
                            <div class="form-group">
                                <label>${t('position')}</label>
                                <input type="text" name="exp_position_${expId}" value="${data.position || ''}" placeholder="${t('position')}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>${t('startDate')}</label>
                                <input type="text" name="exp_start_${expId}" value="${data.start || ''}" placeholder="MM.YYYY">
                            </div>
                            <div class="form-group">
                                <label>${t('endDate')}</label>
                                <input type="text" name="exp_end_${expId}" value="${data.end || ''}" placeholder="${t('present')}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>${t('description')}</label>
                            <textarea name="exp_desc_${expId}" rows="2" placeholder="${t('description')}">${data.desc || ''}</textarea>
                        </div>
                    </div>
                `;
                break;

            case 'education':
                educationCount++;
                const eduId = educationCount;
                html = `
                    <div class="dynamic-entry" data-type="education" data-id="${eduId}">
                        <button type="button" class="remove-btn" onclick="removeEntry(this)" title="${t('remove')}">${t('remove')}</button>
                        <div class="form-row">
                            <div class="form-group">
                                <label>${t('institution')}</label>
                                <input type="text" name="edu_institution_${eduId}" value="${data.institution || ''}" placeholder="${t('institution')}">
                            </div>
                            <div class="form-group">
                                <label>${t('degree')}</label>
                                <input type="text" name="edu_degree_${eduId}" value="${data.degree || ''}" placeholder="${t('degree')}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>${t('startDate')}</label>
                                <input type="text" name="edu_start_${eduId}" value="${data.start || ''}" placeholder="MM.YYYY">
                            </div>
                            <div class="form-group">
                                <label>${t('endDate')}</label>
                                <input type="text" name="edu_end_${eduId}" value="${data.end || ''}" placeholder="MM.YYYY">
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'language':
                languageCount++;
                const langId = languageCount;
                html = `
                    <div class="dynamic-entry" data-type="language" data-id="${langId}">
                        <button type="button" class="remove-btn" onclick="removeEntry(this)" title="${t('remove')}">${t('remove')}</button>
                        <div class="form-row">
                            <div class="form-group">
                                <label>${t('language')}</label>
                                <input type="text" name="lang_name_${langId}" value="${data.name || ''}" placeholder="${t('language')}">
                            </div>
                            <div class="form-group">
                                <label>${t('level')}</label>
                                <select name="lang_level_${langId}">
                                    <option value="native" ${data.level === 'native' ? 'selected' : ''}>${t('native')}</option>
                                    <option value="fluent" ${data.level === 'fluent' ? 'selected' : ''}>${t('fluent')}</option>
                                    <option value="intermediate" ${data.level === 'intermediate' ? 'selected' : ''}>${t('intermediate')}</option>
                                    <option value="basic" ${data.level === 'basic' ? 'selected' : ''}>${t('basic')}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'project':
                projectCount++;
                const projId = projectCount;
                html = `
                    <div class="dynamic-entry" data-type="project" data-id="${projId}">
                        <button type="button" class="remove-btn" onclick="removeEntry(this)" title="${t('remove')}">${t('remove')}</button>
                        <div class="form-row">
                            <div class="form-group">
                                <label>${t('projectName')}</label>
                                <input type="text" name="proj_name_${projId}" value="${data.name || ''}" placeholder="${t('projectName')}">
                            </div>
                            <div class="form-group">
                                <label>${t('projectUrl')}</label>
                                <input type="text" name="proj_url_${projId}" value="${data.url || ''}" placeholder="${t('projectUrl')}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>${t('projectDesc')}</label>
                            <textarea name="proj_desc_${projId}" rows="2" placeholder="${t('projectDesc')}">${data.desc || ''}</textarea>
                        </div>
                    </div>
                `;
                break;
        }

        container.insertAdjacentHTML('beforeend', html);
    }

    window.removeEntry = function(btn) {
        const entry = btn.closest('.dynamic-entry');
        entry.remove();
        saveToStorage();
        updatePreview();
    };

    function getFormData() {
        const form = document.getElementById('cvForm');
        const data = {
            firstName: form.querySelector('#firstName').value,
            lastName: form.querySelector('#lastName').value,
            profession: form.querySelector('#profession').value,
            summary: form.querySelector('#summary').value,
            email: form.querySelector('#email').value,
            phone: form.querySelector('#phone').value,
            location: form.querySelector('#location').value,
            linkedin: form.querySelector('#linkedin').value,
            website: form.querySelector('#website').value,
            skills: form.querySelector('#skills').value,
            experience: [],
            education: [],
            languages: [],
            projects: []
        };

        document.querySelectorAll('[data-type="experience"]').forEach(entry => {
            const id = entry.dataset.id;
            const item = {
                company: entry.querySelector(`[name="exp_company_${id}"]`)?.value || '',
                position: entry.querySelector(`[name="exp_position_${id}"]`)?.value || '',
                start: entry.querySelector(`[name="exp_start_${id}"]`)?.value || '',
                end: entry.querySelector(`[name="exp_end_${id}"]`)?.value || '',
                desc: entry.querySelector(`[name="exp_desc_${id}"]`)?.value || ''
            };
            if (item.company || item.position) data.experience.push(item);
        });

        document.querySelectorAll('[data-type="education"]').forEach(entry => {
            const id = entry.dataset.id;
            const item = {
                institution: entry.querySelector(`[name="edu_institution_${id}"]`)?.value || '',
                degree: entry.querySelector(`[name="edu_degree_${id}"]`)?.value || '',
                start: entry.querySelector(`[name="edu_start_${id}"]`)?.value || '',
                end: entry.querySelector(`[name="edu_end_${id}"]`)?.value || ''
            };
            if (item.institution || item.degree) data.education.push(item);
        });

        document.querySelectorAll('[data-type="language"]').forEach(entry => {
            const id = entry.dataset.id;
            const item = {
                name: entry.querySelector(`[name="lang_name_${id}"]`)?.value || '',
                level: entry.querySelector(`[name="lang_level_${id}"]`)?.value || 'basic'
            };
            if (item.name) data.languages.push(item);
        });

        document.querySelectorAll('[data-type="project"]').forEach(entry => {
            const id = entry.dataset.id;
            const item = {
                name: entry.querySelector(`[name="proj_name_${id}"]`)?.value || '',
                url: entry.querySelector(`[name="proj_url_${id}"]`)?.value || '',
                desc: entry.querySelector(`[name="proj_desc_${id}"]`)?.value || ''
            };
            if (item.name) data.projects.push(item);
        });

        return data;
    }

    function updatePreview() {
        const data = getFormData();
        const preview = document.getElementById('cvPreview');
        preview.className = 'cv-preview template-' + currentTemplate;

        switch (currentTemplate) {
            case 'simple':
                preview.innerHTML = renderSimple(data);
                break;
            case 'modern':
                preview.innerHTML = renderModern(data);
                break;
            case 'it':
                preview.innerHTML = renderIT(data);
                break;
        }
    }

    function renderSimple(data) {
        const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Ism Familiya';
        let html = '';

        html += `<div class="cv-header">`;
        html += `<div class="cv-name">${fullName}</div>`;
        if (data.profession) html += `<div class="cv-profession">${data.profession}</div>`;
        html += `<div class="cv-contact">`;
        if (data.email) html += `<span>${data.email}</span>`;
        if (data.phone) html += `<span>${data.phone}</span>`;
        if (data.location) html += `<span>${data.location}</span>`;
        if (data.linkedin) html += `<span>${data.linkedin}</span>`;
        if (data.website) html += `<span>${data.website}</span>`;
        html += `</div></div>`;

        if (data.summary) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('summary')}</div>`;
            html += `<div class="cv-item-desc">${data.summary}</div></div>`;
        }

        if (data.experience.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('experienceTitle')}</div>`;
            data.experience.forEach(exp => {
                html += `<div class="cv-item">`;
                html += `<div class="cv-item-header">`;
                html += `<span class="cv-item-title">${exp.position}</span>`;
                if (exp.start || exp.end) html += `<span class="cv-item-date">${exp.start}${exp.end ? ' — ' + exp.end : ''}</span>`;
                html += `</div>`;
                if (exp.company) html += `<div class="cv-item-subtitle">${exp.company}</div>`;
                if (exp.desc) html += `<div class="cv-item-desc">${exp.desc}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        if (data.education.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('educationTitle')}</div>`;
            data.education.forEach(edu => {
                html += `<div class="cv-item">`;
                html += `<div class="cv-item-header">`;
                html += `<span class="cv-item-title">${edu.degree}</span>`;
                if (edu.start || edu.end) html += `<span class="cv-item-date">${edu.start}${edu.end ? ' — ' + edu.end : ''}</span>`;
                html += `</div>`;
                if (edu.institution) html += `<div class="cv-item-subtitle">${edu.institution}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        if (data.skills) {
            const skillsArr = data.skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillsArr.length) {
                html += `<div class="cv-section"><div class="cv-section-title">${t('skillsTitle')}</div>`;
                html += `<div class="cv-skills-list">`;
                skillsArr.forEach(skill => {
                    html += `<span class="cv-skill-tag">${skill}</span>`;
                });
                html += `</div></div>`;
            }
        }

        if (data.languages.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('languagesTitle')}</div>`;
            html += `<div class="cv-languages-list">`;
            data.languages.forEach(lang => {
                html += `<span class="cv-lang-item">${lang.name} <span class="cv-lang-level">(${t(lang.level)})</span></span>`;
            });
            html += `</div></div>`;
        }

        if (data.projects.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('projectsTitle')}</div>`;
            data.projects.forEach(proj => {
                html += `<div class="cv-item">`;
                html += `<span class="cv-item-title">${proj.name}</span>`;
                if (proj.url) html += ` — <span class="cv-item-subtitle">${proj.url}</span>`;
                if (proj.desc) html += `<div class="cv-item-desc">${proj.desc}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        return html;
    }

    function renderModern(data) {
        const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Ism Familiya';
        let html = '';

        html += `<div class="cv-sidebar">`;
        html += `<div class="cv-name">${fullName}</div>`;
        if (data.profession) html += `<div class="cv-profession">${data.profession}</div>`;

        html += `<div class="cv-section"><div class="cv-section-title">${t('contact')}</div>`;
        if (data.email) html += `<div class="cv-contact-item">${data.email}</div>`;
        if (data.phone) html += `<div class="cv-contact-item">${data.phone}</div>`;
        if (data.location) html += `<div class="cv-contact-item">${data.location}</div>`;
        if (data.linkedin) html += `<div class="cv-contact-item">${data.linkedin}</div>`;
        if (data.website) html += `<div class="cv-contact-item">${data.website}</div>`;
        html += `</div>`;

        if (data.skills) {
            const skillsArr = data.skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillsArr.length) {
                html += `<div class="cv-section"><div class="cv-section-title">${t('skillsTitle')}</div>`;
                skillsArr.forEach(skill => {
                    html += `<span class="cv-skill-tag">${skill}</span>`;
                });
                html += `</div>`;
            }
        }

        if (data.languages.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('languagesTitle')}</div>`;
            data.languages.forEach(lang => {
                html += `<div class="cv-lang-item"><span>${lang.name}</span><span class="cv-lang-level">${t(lang.level)}</span></div>`;
            });
            html += `</div>`;
        }
        html += `</div>`;

        html += `<div class="cv-main">`;

        if (data.summary) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('summary')}</div>`;
            html += `<div class="cv-item-desc">${data.summary}</div></div>`;
        }

        if (data.experience.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('experienceTitle')}</div>`;
            data.experience.forEach(exp => {
                html += `<div class="cv-item">`;
                html += `<div class="cv-item-title">${exp.position}</div>`;
                if (exp.company) html += `<div class="cv-item-subtitle">${exp.company}</div>`;
                if (exp.start || exp.end) html += `<div class="cv-item-date">${exp.start}${exp.end ? ' — ' + exp.end : ''}</div>`;
                if (exp.desc) html += `<div class="cv-item-desc">${exp.desc}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        if (data.education.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('educationTitle')}</div>`;
            data.education.forEach(edu => {
                html += `<div class="cv-item">`;
                html += `<div class="cv-item-title">${edu.degree}</div>`;
                if (edu.institution) html += `<div class="cv-item-subtitle">${edu.institution}</div>`;
                if (edu.start || edu.end) html += `<div class="cv-item-date">${edu.start}${edu.end ? ' — ' + edu.end : ''}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        if (data.projects.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('projectsTitle')}</div>`;
            data.projects.forEach(proj => {
                html += `<div class="cv-item">`;
                html += `<div class="cv-item-title">${proj.name}</div>`;
                if (proj.url) html += `<div class="cv-item-subtitle">${proj.url}</div>`;
                if (proj.desc) html += `<div class="cv-item-desc">${proj.desc}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    function renderIT(data) {
        const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Ism Familiya';
        let html = '';

        html += `<div class="cv-header">`;
        html += `<div class="cv-name">${fullName}</div>`;
        if (data.profession) html += `<div class="cv-profession">${data.profession}</div>`;
        html += `<div class="cv-contact">`;
        if (data.email) html += `<span>${data.email}</span>`;
        if (data.phone) html += `<span>${data.phone}</span>`;
        if (data.location) html += `<span>${data.location}</span>`;
        if (data.linkedin) html += `<span>${data.linkedin}</span>`;
        if (data.website) html += `<span>${data.website}</span>`;
        html += `</div></div>`;

        if (data.summary) {
            html += `<div class="cv-summary">${data.summary}</div>`;
        }

        if (data.skills) {
            const skillsArr = data.skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillsArr.length) {
                html += `<div class="cv-section"><div class="cv-section-title">${t('skillsTitle')}</div>`;
                html += `<div class="cv-skills-list">`;
                skillsArr.forEach(skill => {
                    html += `<span class="cv-skill-tag">${skill}</span>`;
                });
                html += `</div></div>`;
            }
        }

        if (data.experience.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('experienceTitle')}</div>`;
            data.experience.forEach(exp => {
                html += `<div class="cv-item">`;
                html += `<div class="cv-item-title">${exp.position}</div>`;
                if (exp.company) html += `<div class="cv-item-subtitle">${exp.company}</div>`;
                if (exp.start || exp.end) html += `<div class="cv-item-date">${exp.start}${exp.end ? ' — ' + exp.end : ''}</div>`;
                if (exp.desc) html += `<div class="cv-item-desc">${exp.desc}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        if (data.education.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('educationTitle')}</div>`;
            data.education.forEach(edu => {
                html += `<div class="cv-item">`;
                html += `<div class="cv-item-title">${edu.degree}</div>`;
                if (edu.institution) html += `<div class="cv-item-subtitle">${edu.institution}</div>`;
                if (edu.start || edu.end) html += `<div class="cv-item-date">${edu.start}${edu.end ? ' — ' + edu.end : ''}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        if (data.projects.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('projectsTitle')}</div>`;
            data.projects.forEach(proj => {
                html += `<div class="cv-item">`;
                html += `<div class="cv-item-title">${proj.name}</div>`;
                if (proj.url) html += `<div class="cv-item-subtitle">${proj.url}</div>`;
                if (proj.desc) html += `<div class="cv-item-desc">${proj.desc}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        if (data.languages.length) {
            html += `<div class="cv-section"><div class="cv-section-title">${t('languagesTitle')}</div>`;
            html += `<div class="cv-languages-list">`;
            data.languages.forEach(lang => {
                html += `<span class="cv-lang-item">${lang.name} <span class="cv-lang-level">(${t(lang.level)})</span></span>`;
            });
            html += `</div></div>`;
        }

        return html;
    }

    function saveToStorage() {
        const data = getFormData();
        localStorage.setItem('cv_data', JSON.stringify(data));
    }

    function loadFromStorage() {
        const saved = localStorage.getItem('cv_data');
        if (!saved) return;

        try {
            const data = JSON.parse(saved);

            const fields = ['firstName', 'lastName', 'profession', 'summary', 'email', 'phone', 'location', 'linkedin', 'website', 'skills'];
            fields.forEach(field => {
                const el = document.getElementById(field);
                if (el && data[field]) el.value = data[field];
            });

            if (data.experience?.length) {
                data.experience.forEach(exp => addDynamicEntry('experience', exp));
            }

            if (data.education?.length) {
                data.education.forEach(edu => addDynamicEntry('education', edu));
            }

            if (data.languages?.length) {
                data.languages.forEach(lang => addDynamicEntry('language', lang));
            }

            if (data.projects?.length) {
                data.projects.forEach(proj => addDynamicEntry('project', proj));
            }
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }

    function downloadPdf() {
        const element = document.getElementById('cvPreview');
        const fullName = [getFormData().firstName, getFormData().lastName].filter(Boolean).join('_') || 'CV';

        const opt = {
            margin: 0,
            filename: `${fullName}_CV.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    }

    function clearForm() {
        if (!confirm(t('formCleared') + ' ' + t('clearForm') + '?')) return;

        document.getElementById('cvForm').reset();
        document.getElementById('experienceList').innerHTML = '';
        document.getElementById('educationList').innerHTML = '';
        document.getElementById('languageList').innerHTML = '';
        document.getElementById('projectList').innerHTML = '';
        experienceCount = 0;
        educationCount = 0;
        languageCount = 0;
        projectCount = 0;
        localStorage.removeItem('cv_data');
        updatePreview();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
