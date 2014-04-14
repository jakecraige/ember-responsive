/**
 * Handles detecting and responding to media queries.
 *
 * The constructor takes a list of matchers, which are named media queries
 * that you can access on the created object. Take a look:
 *
 * @example
 *   m = Ember.Responsive.Media.create({
 *     matchers: {
 *       all: 'all',
 *     }
 *   });
 *
 *   m.get('all.matches');
 *   m.get('isAll');
 *   // => true
 *
 * You can also declare matchers dynamically, which is useful for overriding
 * matchers at test time. For example, testing mobile can be easily mocked out:
 *
 * @example
 *   m = Ember.Responsive.Media.create();
 *   m.match('mobile', 'all');
 *   m.get('mobile.matches');
 *   // => true
 *
 * There are also convenience properties defined for determining
 * if there is a media type match
 *
 * @example
 *   m = Ember.Responsive.Media.create();
 *   m.match('mobile', 'all');
 *   m.get('isMobile');
 *   // => true
 *
 * You can also see a full list of matched media types. The class can
 * also return that list as a string of dasherized class names, which
 * is useful for placing on your container element.
 *
 * @example
 *   m = Ember.Responsive.Media.create();
 *   m.match('all', 'all');
 *   m.match('mobile', 'all');
 *   m.match('none', 'not all');
 *   m.get('matching')
 *   // => Ember.Set(['all', 'mobile']);
 *   m.get('classNames');
 *   // => 'media-all media-mobile'
 *
 * @class  Ember.Responsive.Media
 */
Ember.Responsive.Media = Ember.Object.extend({
  /**
   * A list of media queries that we want to test for.
   *
   * @property  queries
   * @type      object
   */
  matchers: {},

  /**
   * A set of matching matchers.
   *
   * @property  matching
   * @type      Ember.Set
   */
  matching: function() {
    return new Ember.Set();
  }.property(),

  /**
   * The matcher to use for testing media queries.
   *
   * @property  matcher
   * @type      matchMedia
   */
  mql: window.matchMedia,

  /**
   * A string composed of all the matching matchers' names, turned into
   * friendly, dasherized class-names.
   *
   * @property  classNames
   * @type      string
   */
  classNames: function() {
    return this.get('matching').map(function(name) {
      return 'media-' + name.dasherize();
    }).join(' ');
  }.property('matching.@each'),

  /**
   * Adds a new matcher to the list.
   *
   * After this method is called, you will be able to access the result
   * of the matcher as a property on this object.
   *
   * @example
   *  media = Ember.Responsive.Media.create();
   *  media.match('all', 'all');
   *  media.get('all');
   *    // => instanceof window.matchMedia
   *  media.get('all.matches');
   *    // => true
   *
   * @method  match
   */
  match: function(name, query) {
    var matcher = this.get('mql')(query),
        isser = 'is' + name.classify(),
        _this = this;

    var listener = function(matcher) {
      _this.set(name, matcher);

      if (matcher.matches) {
        _this.get('matching').add(name);
      } else {
        _this.get('matching').remove(name);
      }
    };

    matcher.addListener(listener);
    listener(matcher);

    // Define a corresponding "isser" which is prettier to look at and type
    Ember.defineProperty(this, isser, Ember.computed(function() {
      return this.get(name).matches;
    }).property(name));
  },

  /**
   * Initializes the matchers declared at construction.
   *
   * @method initMatchers
   * @event  init
   */
  initMatchers: function() {
    var matchers = this.get('matchers');

    for (var name in matchers) {
      if (matchers.hasOwnProperty(name)) {
        this.match(name, matchers[name]);
      }
    }
  }.observes('matchers').on('init'),
});