import * as chrono from 'chrono-node';

const months = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function formatAdvancedDate(d) {
    if (!d) return "";

    let s = "";
    switch (d.qualifier) {
        case "about":
            s += "Abt. ";
            break;
        case "before":
            s += "Before ";
            break;
        case "after":
            s += "After ";
    }
    
    if (d.day) {
        s += `${d.day} `;
    }

    if (d.month) {
        s += `${months[d.month]} `;
    }

    if (d.year) {
        s += d.year;
    }

    return s.trim();
} 

export function parseAdvancedDate(s) {

    const getQualifier = (pre) => {
        if (pre) {
            let cleaned = pre.trim().toLowerCase();
            switch (cleaned) {
                case 'abt.':
                    return 'about';
                case 'about':
                case 'before':
                case 'after': 
                    return cleaned;
            }
        }
    }

    // an important case that's not handled well by chrono
    const bits = s.trim().split(" ").filter((bit) => (bit.length > 0));
    if (bits.length >= 1 && bits.length <= 2) {
        const tryYear = parseInt(bits.pop().trim());
        const qualifierOK = bits.length == 0 || getQualifier(bits[0]);
        if (tryYear && tryYear > 1500 && tryYear < 2500 && qualifierOK) 
        {
            const output = {year: tryYear};
            const qualifier = getQualifier(bits[0]);
            if (qualifier)
                output.qualifier = qualifier;  
            return output;
        }
    } 
        

    const parsed = chrono.parse(s)[0];
    if (parsed && parsed.start && parsed.start.isCertain('year')) {
        const output = {year: parsed.start.get('year')};
        if (parsed.start.isCertain('month'))
            output.month = parsed.start.get('month');
        if (parsed.start.isCertain('day'))
            output.day = parsed.start.get('day');

        const qualifier = getQualifier(s.substr(0, parsed.index));
        if (qualifier)
            output.qualifier = qualifier;  
        return output;      
    } 
    
}

