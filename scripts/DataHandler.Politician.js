// define class Politician, stores and returns formated data
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
            // percent with tooltip showing underlying values
            case 'percentLoyaltyToolTip':
                return $('<div>')
                    .text((+value).toFixed(1) + '%')
                    .addClass('toolTip')
                    .append($("<span>")
                        .html(this.data.party_votes+' party votes<br>'+this.data.total_votes+' total votes')
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
