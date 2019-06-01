import DS from 'ember-data';

export default DS.Model.extend({
	describe: DS.attr('string'),
	name: DS.attr('string'),
	cities: DS.hasMany('city'),
	images: DS.hasMany('image')
});
