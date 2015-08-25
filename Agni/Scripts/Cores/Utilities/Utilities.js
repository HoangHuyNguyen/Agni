function LoadSourceFromFile( fileName )
{
    this.source;
    var request = new XMLHttpRequest();

    request.onreadystatechange = function(){
        if ( request.readyState === 4 && request.status !== 404 ){
            if ( request.status == 200 ) {
                this.source = request.responseText;
            }
        }
        else
        {
            console.log( 'Cannot open file ' + fileName );
        }
    }
    
    request.open( 'GET', fileName, true );
    request.send();
    
    return this.source;
};

var RadToDegree = function( rad )
{
    return ( rad * 180 ) / Math.PI;
}

var DegToRad = function( deg )
{
    return ( deg * Math.PI ) / 180;
}

function isBitSet( value, position )
{
    return value & ( 1 << position );
}

