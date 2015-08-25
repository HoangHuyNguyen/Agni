function lerp( a, b, ratio)
{
	return  ( 1 - ratio ) * a + ratio * b;
}

function rand( min, max )
{
	 return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}