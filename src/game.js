(function(global,factory){
	if(typeof define==="function" && define.amd)
		define(['exports'], factory) //AMD
	else factory(global);
})(typeof window === "object" ? window.Game = {} : module.exports = {},
function(game){
	game.handler = function(bHandler, eHandler, iHandler) {
		this.man = bHandler;
		this.enemy = eHandler;
		this.image = iHandler;
	}
})