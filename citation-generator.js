/**
 * Citation Generator
 * Supports multiple citation styles: APA, MLA, Chicago, Harvard, IEEE
 */

class CitationGenerator {
    constructor() {
        this.citations = [];
        this.styles = ['apa', 'mla', 'chicago', 'harvard', 'ieee'];
    }

    /**
     * Generate citation based on style and type
     */
    generate(data, style = 'apa', type = 'article') {
        const generator = this[`generate${style.toUpperCase()}`];
        
        if (!generator) {
            throw new Error(`Citation style '${style}' not supported`);
        }

        let citation = generator.call(this, data, type);
        
        // Store citation
        this.citations.push({
            id: `cite-${Date.now()}`,
            citation: citation,
            style: style,
            type: type,
            data: data,
            timestamp: new Date()
        });

        return citation;
    }

    /**
     * APA 7th Edition Citation Generator
     */
    generateAPA(data, type) {
        const { authors, year, title, source, volume, issue, pages, doi, url } = data;

        switch (type) {
            case 'article':
                let citation = this.formatAuthorsAPA(authors);
                citation += ` (${year}). `;
                citation += `${title}. `;
                citation += `<em>${source}</em>`;
                if (volume) citation += `, <em>${volume}</em>`;
                if (issue) citation += `(${issue})`;
                if (pages) citation += `, ${pages}`;
                citation += '.';
                if (doi) citation += ` https://doi.org/${doi}`;
                else if (url) citation += ` ${url}`;
                return citation;

            case 'book':
                citation = this.formatAuthorsAPA(authors);
                citation += ` (${year}). `;
                citation += `<em>${title}</em>`;
                if (data.edition) citation += ` (${data.edition} ed.)`;
                citation += `. ${source}.`;
                if (doi) citation += ` https://doi.org/${doi}`;
                return citation;

            case 'website':
                citation = this.formatAuthorsAPA(authors || 'Author');
                citation += ` (${year}). `;
                citation += `<em>${title}</em>. `;
                if (source) citation += `${source}. `;
                if (url) citation += url;
                if (data.accessDate) citation += ` (accessed ${data.accessDate})`;
                return citation;

            case 'conference':
                citation = this.formatAuthorsAPA(authors);
                citation += ` (${year}). `;
                citation += `${title}. `;
                citation += `In <em>${source}</em>`;
                if (pages) citation += ` (pp. ${pages})`;
                citation += '.';
                if (doi) citation += ` https://doi.org/${doi}`;
                return citation;

            default:
                return this.generateAPA(data, 'article');
        }
    }

    /**
     * MLA 9th Edition Citation Generator
     */
    generateMLA(data, type) {
        const { authors, year, title, source, volume, issue, pages, doi, url } = data;

        switch (type) {
            case 'article':
                let citation = this.formatAuthorsMLA(authors);
                citation += ` "${title}." `;
                citation += `<em>${source}</em>`;
                if (volume) citation += `, vol. ${volume}`;
                if (issue) citation += `, no. ${issue}`;
                citation += `, ${year}`;
                if (pages) citation += `, pp. ${pages}`;
                citation += '.';
                if (doi) citation += ` https://doi.org/${doi}.`;
                else if (url) citation += ` ${url}.`;
                return citation;

            case 'book':
                citation = this.formatAuthorsMLA(authors);
                citation += ` <em>${title}</em>. `;
                citation += `${source}, ${year}.`;
                return citation;

            case 'website':
                citation = this.formatAuthorsMLA(authors || 'Author');
                citation += ` "${title}." `;
                if (source) citation += `<em>${source}</em>, `;
                citation += `${year}`;
                if (url) citation += `, ${url}`;
                citation += '.';
                return citation;

            case 'conference':
                citation = this.formatAuthorsMLA(authors);
                citation += ` "${title}." `;
                citation += `<em>${source}</em>, ${year}`;
                if (pages) citation += `, pp. ${pages}`;
                citation += '.';
                return citation;

            default:
                return this.generateMLA(data, 'article');
        }
    }

    /**
     * Chicago Style Citation Generator
     */
    generateCHICAGO(data, type) {
        const { authors, year, title, source, volume, issue, pages, doi, url } = data;

        switch (type) {
            case 'article':
                let citation = this.formatAuthorsChicago(authors);
                citation += ` "${title}." `;
                citation += `<em>${source}</em> `;
                if (volume) citation += `${volume}`;
                if (issue) citation += `, no. ${issue}`;
                citation += ` (${year})`;
                if (pages) citation += `: ${pages}`;
                citation += '.';
                if (doi) citation += ` https://doi.org/${doi}.`;
                return citation;

            case 'book':
                citation = this.formatAuthorsChicago(authors);
                citation += ` <em>${title}</em>. `;
                if (data.place) citation += `${data.place}: `;
                citation += `${source}, ${year}.`;
                return citation;

            case 'website':
                citation = this.formatAuthorsChicago(authors || 'Author');
                citation += ` "${title}." `;
                if (source) citation += `${source}. `;
                citation += `${year}. `;
                if (url) citation += url;
                citation += '.';
                return citation;

            default:
                return this.generateCHICAGO(data, 'article');
        }
    }

    /**
     * Harvard Style Citation Generator
     */
    generateHARVARD(data, type) {
        const { authors, year, title, source, volume, issue, pages, doi, url } = data;

        switch (type) {
            case 'article':
                let citation = this.formatAuthorsHarvard(authors);
                citation += ` (${year}) `;
                citation += `'${title}', `;
                citation += `<em>${source}</em>`;
                if (volume) citation += `, ${volume}`;
                if (issue) citation += `(${issue})`;
                if (pages) citation += `, pp. ${pages}`;
                citation += '.';
                if (doi) citation += ` doi: ${doi}`;
                else if (url) citation += ` Available at: ${url}`;
                return citation;

            case 'book':
                citation = this.formatAuthorsHarvard(authors);
                citation += ` (${year}) `;
                citation += `<em>${title}</em>. `;
                if (data.edition) citation += `${data.edition} edn. `;
                if (data.place) citation += `${data.place}: `;
                citation += `${source}.`;
                return citation;

            case 'website':
                citation = this.formatAuthorsHarvard(authors || 'Author');
                citation += ` (${year}) `;
                citation += `<em>${title}</em>. `;
                citation += `Available at: ${url}`;
                if (data.accessDate) citation += ` (Accessed: ${data.accessDate})`;
                citation += '.';
                return citation;

            default:
                return this.generateHARVARD(data, 'article');
        }
    }

    /**
     * IEEE Style Citation Generator
     */
    generateIEEE(data, type) {
        const { authors, year, title, source, volume, issue, pages, doi } = data;

        switch (type) {
            case 'article':
                let citation = this.formatAuthorsIEEE(authors);
                citation += `, "${title}," `;
                citation += `<em>${source}</em>`;
                if (volume) citation += `, vol. ${volume}`;
                if (issue) citation += `, no. ${issue}`;
                if (pages) citation += `, pp. ${pages}`;
                citation += `, ${year}`;
                if (doi) citation += `, doi: ${doi}`;
                citation += '.';
                return citation;

            case 'book':
                citation = this.formatAuthorsIEEE(authors);
                citation += `, <em>${title}</em>`;
                if (data.edition) citation += `, ${data.edition} ed.`;
                citation += ` ${source}, ${year}.`;
                return citation;

            case 'conference':
                citation = this.formatAuthorsIEEE(authors);
                citation += `, "${title}," `;
                citation += `in <em>${source}</em>, ${year}`;
                if (pages) citation += `, pp. ${pages}`;
                citation += '.';
                return citation;

            default:
                return this.generateIEEE(data, 'article');
        }
    }

    /**
     * Format authors for APA style
     */
    formatAuthorsAPA(authors) {
        if (!authors) return 'Author';
        
        const authorList = authors.split(';').map(a => a.trim());
        
        if (authorList.length === 1) {
            return authorList[0];
        } else if (authorList.length === 2) {
            return `${authorList[0]}, & ${authorList[1]}`;
        } else if (authorList.length <= 20) {
            const lastAuthor = authorList.pop();
            return `${authorList.join(', ')}, & ${lastAuthor}`;
        } else {
            return `${authorList.slice(0, 19).join(', ')}, ... ${authorList[authorList.length - 1]}`;
        }
    }

    /**
     * Format authors for MLA style
     */
    formatAuthorsMLA(authors) {
        if (!authors) return 'Author';
        
        const authorList = authors.split(';').map(a => a.trim());
        
        if (authorList.length === 1) {
            return `${authorList[0]}.`;
        } else if (authorList.length === 2) {
            return `${authorList[0]}, and ${authorList[1]}.`;
        } else {
            return `${authorList[0]}, et al.`;
        }
    }

    /**
     * Format authors for Chicago style
     */
    formatAuthorsChicago(authors) {
        if (!authors) return 'Author';
        
        const authorList = authors.split(';').map(a => a.trim());
        
        if (authorList.length === 1) {
            return `${authorList[0]}.`;
        } else if (authorList.length === 2) {
            return `${authorList[0]}, and ${authorList[1]}.`;
        } else if (authorList.length === 3) {
            return `${authorList[0]}, ${authorList[1]}, and ${authorList[2]}.`;
        } else {
            return `${authorList[0]} et al.`;
        }
    }

    /**
     * Format authors for Harvard style
     */
    formatAuthorsHarvard(authors) {
        if (!authors) return 'Author';
        
        const authorList = authors.split(';').map(a => a.trim());
        
        if (authorList.length === 1) {
            return authorList[0];
        } else if (authorList.length === 2) {
            return `${authorList[0]} and ${authorList[1]}`;
        } else {
            return `${authorList[0]} et al.`;
        }
    }

    /**
     * Format authors for IEEE style
     */
    formatAuthorsIEEE(authors) {
        if (!authors) return 'Author';
        
        const authorList = authors.split(';').map(a => a.trim());
        
        if (authorList.length === 1) {
            return authorList[0];
        } else if (authorList.length <= 6) {
            const lastAuthor = authorList.pop();
            return `${authorList.join(', ')}, and ${lastAuthor}`;
        } else {
            return `${authorList[0]} et al.`;
        }
    }

    /**
     * Get all citations
     */
    getAllCitations() {
        return this.citations;
    }

    /**
     * Clear all citations
     */
    clearCitations() {
        this.citations = [];
    }

    /**
     * Export citations as bibliography
     */
    exportBibliography(style = 'apa') {
        let bibliography = '<div class="bibliography">\n';
        bibliography += `<h2>References</h2>\n`;
        bibliography += '<ol class="citation-list">\n';

        this.citations.forEach(cite => {
            bibliography += `  <li>${cite.citation}</li>\n`;
        });

        bibliography += '</ol>\n</div>\n';
        return bibliography;
    }

    /**
     * Generate BibTeX format
     */
    exportBibTeX(data, key) {
        const { authors, year, title, source, volume, issue, pages, doi } = data;
        
        let bibtex = `@article{${key || 'citation' + Date.now()},\n`;
        if (authors) bibtex += `  author = {${authors.replace(/;/g, ' and ')}},\n`;
        if (year) bibtex += `  year = {${year}},\n`;
        if (title) bibtex += `  title = {${title}},\n`;
        if (source) bibtex += `  journal = {${source}},\n`;
        if (volume) bibtex += `  volume = {${volume}},\n`;
        if (issue) bibtex += `  number = {${issue}},\n`;
        if (pages) bibtex += `  pages = {${pages}},\n`;
        if (doi) bibtex += `  doi = {${doi}},\n`;
        bibtex += '}\n';
        
        return bibtex;
    }

    /**
     * Generate RIS format
     */
    exportRIS(data, type = 'JOUR') {
        const { authors, year, title, source, volume, issue, pages, doi, url } = data;
        
        let ris = `TY  - ${type}\n`;
        if (authors) {
            authors.split(';').forEach(author => {
                ris += `AU  - ${author.trim()}\n`;
            });
        }
        if (year) ris += `PY  - ${year}\n`;
        if (title) ris += `TI  - ${title}\n`;
        if (source) ris += `JO  - ${source}\n`;
        if (volume) ris += `VL  - ${volume}\n`;
        if (issue) ris += `IS  - ${issue}\n`;
        if (pages) ris += `SP  - ${pages.split('-')[0]}\n`;
        if (pages && pages.includes('-')) ris += `EP  - ${pages.split('-')[1]}\n`;
        if (doi) ris += `DO  - ${doi}\n`;
        if (url) ris += `UR  - ${url}\n`;
        ris += 'ER  - \n';
        
        return ris;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CitationGenerator;
}
