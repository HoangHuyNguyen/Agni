var EngineCores = (function()
{
	var instance;

	function constructor()
	{
		return { 	
			Graphics : null,
			Physics : null,
			AI : null,
			Load : function()
			{
				this.Graphics = CGraphicManager.Instance();
				this.Graphics.Initialize();
			},
			LoadGraphic : function()
			{
				this.Graphics = CGraphicManager.Instance();
				this.Graphics.Initialize();
			}
		}
	};
	
	return { 
		Instance: function() 
		{
			if( !instance )
			{
			 	instance = constructor();
			}
			return instance;
		}
	};

})();