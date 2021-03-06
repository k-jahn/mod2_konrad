// define class Politician, stores and returns formated data for DataHandler
function Politician(data,parent) {
    //store json data
    this.data = data;
    //store parent
    this.parent=parent;
    // method that returns formatted data 
    this.show = function(key, format) {
        var value = this.data[key]
        //check if there's a searchHit
        for (var hit of parent.searchHitTable) {
            if (this.data.id==hit.id && hit.hasOwnProperty(key)) {
                value=hit[key]
                break
            }
        }
        // english language number formater
        var nTh = function(n){
            switch (+n%100) {
                case 11:
                    return '11th'
                case 12:
                    return '12th'
                case 13:
                    return '13th'
                default:
                    switch (+n%10) {
                        case 1:
                            return n+"st"
                        case 2:
                            return n+"nd"
                        case 3:
                            return n+"rd"
                        default:
                            return n+"th"
                    }
            }
        }
        // different formatting options
        switch (format || 'plain') {
            //plain text
            case 'plain':
                return value;
            //party icons
            case 'party':
                var out=function(text,href){
                    return $('<span>').addClass('partySpan toolTip')
                        .append($('<img>').attr('src',href))
                        .append($('<span>')
                            .text(text)
                            .addClass('toolTipText')
                            )
                }
                switch (value) {
                    case 'D': 
                        return out('Democrat','images/democrat.png')
                    case 'R':
                        return out('Republican','images/republican.png')
                    case 'I':
                        return out('Independent','images/independent.png')
                    default:
                        return 'A miracle!'
                }
            // percent values with fixed accuracy
            case 'percent':
                return (+value).toFixed(1) + '%';
            // percent with tooltip showing total votes and party votes
            case 'percentLoyaltyToolTip':
                return $('<div>')
                    .text((+value).toFixed(1) + '%')
                    .addClass('toolTip')
                    .append($("<span>")
                        .html(this.data.party_votes+' party votes<br>'+this.data.total_votes+' total votes')
                        .addClass('toolTipText')
                        )
            // value with tooltip showing district
            case 'districtToolTip':
                return $('<div>')
                    .text(value)
                    .addClass('toolTip')
                    .append($("<span>")
                        .html(nTh(this.data.district)+' congressional district')
                        .addClass('toolTipText')
                        )
            // value with tooltip senator class
            case 'classToolTip':
                return $('<div>')
                    .text(value)
                    .addClass('toolTip')
                    .append($("<span>")
                        .html('Senator '+nTh(+this.data.senate_class)+' class')
                        .addClass('toolTipText')
                        )
            // years
                
            case 'years' :
                if (value==0) {
                    return 'none'
                }
                if (value==1) {
                    return value + ' year';
                }
                return value + ' years';
            // as colorbox link to homepage
            case 'linkUrl':
                return $('<a>')
                    .attr('href',this.data.url)
                    .html(value)
                    //colorbox (tm) plugin!
                    .colorbox({iframe:true, width:"80%", height:"80%"});
            default:
                console.log('bad format '+format)
                return value;                
        }
    }

    // set value
    this.set = function(key,value) {
        this.data[key]=value
    }

    // initialize, calculate additional values
    this.init = function() {
        //make own copy of data
        this.data=JSON.parse(JSON.stringify(this.data));
        //set full_name
        var name = [this.data.first_name];
        if (this.data.middle_name) name.push(this.data.middle_name);
        name.push(this.data.last_name);
        this.data.full_name = name.join(' '); 
        //set party_votes
        this.data.party_votes=Math.round(this.data.total_votes*this.data.votes_with_party_pct/100);
    }
}
