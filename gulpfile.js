var gulp 			= require('gulp'),
	rjs 			= require('gulp-requirejs'),
	rename 			= require('gulp-rename'),
	bower 			= require('gulp-bower'),
	gulpFilter 		= require('gulp-filter'),
	uglify 			= require('gulp-uglify'),
	imagemin 		= require('gulp-imagemin'),
	mainBowerFiles 	= require('main-bower-files'),
	del 			= require('del'),
	vinylPaths 		= require('vinyl-paths'),
	bowerpkg 		= require(__dirname+'/bower.json');

gulp.task('bower', function(){
	var mainFilter = gulpFilter(['*','!**/main.js']);
	switch(process.env.NODE_ENV) {
		case "production":
		case "development":
		default:
			gulp.src(mainBowerFiles())
				.pipe(rename(function(path){
					for(var i in bowerpkg.dependencies)
						if(~path.basename.indexOf(i.replace(/js$/,'')))
							path.basename = i.replace(/js$/,'');
				}))
				.pipe(gulp.dest('public/lib'));
	}
});

gulp.task('controller', function(){
	switch(process.env.NODE_ENV) {
		case "production":
		case "development":
		default:
			gulp.src(['src/*.js','!**/main.js'])
				.pipe(gulp.dest('public/src'));
			gulp.src(['src/main.js'])
				.pipe(gulp.dest('public'));
	}
});

gulp.task('images', function(){
	switch(process.env.NODE_ENV) {
		case "production":
		case "development":
		default:
			gulp.src(['images/*.gif'])
				.pipe(imagemin({
			        optimizationLevel: 5,
			        progressive: true,
			        interlaced: true
			    }))
				.pipe(gulp.dest('public/images'));
	}
})

gulp.task('requirejsBuild', function(){
	rjs({
		baseUrl: './public',
		out : 'main.js',
		name: 'main',
		fileExclusionRegExp: /socket\.io\/socket\.io\.js/,
		paths: {
			bomberMan : "src/bomber_man",
			enemy : "src/enemy",
			imageHandler : "src/image_handler",
			game : "src/game",
			easeljs : "lib/easel",
			underscore : "lib/underscore",
			interproc : "src/intervalProcess",
			socketio : "empty:"
		},
		shim: {
			game : {
				deps : [
				'enemy',
				'bomberMan',
				'imageHandler',
				'underscore'
				]
			},
			imageHandler : {
				deps : [
				'easeljs',
				'underscore'
				]
			},
			easeljs : {
				exports : 'createjs'
			},
			socketio : {
				exports : 'io'
			},
			underscore : {
				exports : '_'
			}
		}
	})
	.pipe(uglify())
	.pipe(gulp.dest('public'));

	gulp.src(['public/src'])
		.pipe(vinylPaths(del));
})

gulp.task('default', ['bower', 'controller', 'images']);
