//
//  EntityPropertyFlags.ts
//
//  Created by Julien Merzoug on 11 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PropertyFlags from "../shared/PropertyFlags";

/*@devdoc
 *  The <code>EntityPropertyList</code> namespace provides the positions of the flags in {@link PropertyFlags}.
 *  @namespace EntityPropertyList
 *  @property {number} PROP_PAGED_PROPERTY - <code>0</code> - Paged property flag.
 *  @property {number} PROP_CUSTOM_PROPERTIES_INCLUDED - <code>1</code> - Custom properties included flag.
 *  @property {number} PROP_SIMULATION_OWNER - <code>2</code> - Simulation owner flag.
 *  @property {number} PROP_PARENT_ID - <code>3</code> - Parent id flag.
 *  @property {number} PROP_PARENT_JOINT_INDEX - <code>4</code> - Parent joint index flag.
 *  @property {number} PROP_VISIBLE - <code>5</code> - Visible flag.
 *  @property {number} PROP_NAME - <code>6</code> - Name flag.
 *  @property {number} PROP_LOCKED - <code>7</code> - Locked flag.
 *  @property {number} PROP_USER_DATA - <code>8</code> - User data flag.
 *  @property {number} PROP_PRIVATE_USER_DATA - <code>9</code> - Private user data flag.
 *  @property {number} PROP_HREF - <code>10</code> - Href flag.
 *  @property {number} PROP_DESCRIPTION - <code>11</code> - Description flag.
 *  @property {number} PROP_POSITION - <code>12</code> - Position flag.
 *  @property {number} PROP_DIMENSIONS - <code>13</code> - Dimensions flag.
 *  @property {number} PROP_ROTATION - <code>14</code> - Rotation flag.
 *  @property {number} PROP_REGISTRATION_POINT - <code>15</code> - Registration point flag.
 *  @property {number} PROP_CREATED - <code>16</code> - Created flag.
 *  @property {number} PROP_LAST_EDITED_BY - <code>17</code> - Last edited by flag.
 *  @property {number} PROP_ENTITY_HOST_TYPE - <code>18</code> - Entity host type flag.
 *  @property {number} PROP_OWNING_AVATAR_ID - <code>19</code> - Owning avatar id flag.
 *  @property {number} PROP_QUERY_AA_CUBE - <code>20</code> - Query aa cube flag.
 *  @property {number} PROP_CAN_CAST_SHADOW - <code>21</code> - Can cast shadow flag.
 *  @property {number} PROP_VISIBLE_IN_SECONDARY_CAMERA - <code>22</code> - Visible in secondary camera flag.
 *  @property {number} PROP_RENDER_LAYER - <code>23</code> - Render layer flag.
 *  @property {number} PROP_PRIMITIVE_MODE - <code>24</code> - Primitive mode flag.
 *  @property {number} PROP_IGNORE_PICK_INTERSECTION - <code>25</code> - Ignore pick intersection flag.
 *  @property {number} PROP_RENDER_WITH_ZONES - <code>26</code> - Render with zones flag.
 *  @property {number} PROP_BILLBOARD_MODE - <code>27</code> - Billboard mode flag.
 *  @property {number} PROP_GRAB_GRABBABLE - <code>28</code> - Grab grabbable flag.
 *  @property {number} PROP_GRAB_KINEMATIC - <code>29</code> - Grab kinematic flag.
 *  @property {number} PROP_GRAB_FOLLOWS_CONTROLLER - <code>30</code> - Grab follows controller flag.
 *  @property {number} PROP_GRAB_TRIGGERABLE - <code>31</code> - Grab triggerable flag.
 *  @property {number} PROP_GRAB_EQUIPPABLE - <code>32</code> - Grab equippable flag.
 *  @property {number} PROP_GRAB_DELEGATE_TO_PARENT - <code>33</code> - Grab delegate to parent flag.
 *  @property {number} PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET - <code>34</code> - Grab left equippable position offset flag.
 *  @property {number} PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET - <code>35</code> - Grab left equippable rotation offset flag.
 *  @property {number} PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET - <code>36</code> - Grab right equippable position offset
 *      flag.
 *  @property {number} PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET - <code>37</code> - Grab right equippable rotation offset
 *      flag.
 *  @property {number} PROP_GRAB_EQUIPPABLE_INDICATOR_URL - <code>38</code> - Grab equippable indicator url flag.
 *  @property {number} PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE - <code>39</code> - Grab equippable indicator scale flag.
 *  @property {number} PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET - <code>40</code> - Grab equippable indicator offset flag.
 *  @property {number} PROP_DENSITY - <code>41</code> - Density flag.
 *  @property {number} PROP_VELOCITY - <code>42</code> - Velocity flag.
 *  @property {number} PROP_ANGULAR_VELOCITY - <code>43</code> - Angular velocity flag.
 *  @property {number} PROP_GRAVITY - <code>44</code> - Gravity flag.
 *  @property {number} PROP_ACCELERATION - <code>45</code> - Acceleration flag.
 *  @property {number} PROP_DAMPING - <code>46</code> - Damping flag.
 *  @property {number} PROP_ANGULAR_DAMPING - <code>47</code> - Angular damping flag.
 *  @property {number} PROP_RESTITUTION - <code>48</code> - Restitution flag.
 *  @property {number} PROP_FRICTION - <code>49</code> - Friction flag.
 *  @property {number} PROP_LIFETIME - <code>50</code> - Lifetime flag.
 *  @property {number} PROP_COLLISIONLESS - <code>51</code> - Collisionless flag.
 *  @property {number} PROP_COLLISION_MASK - <code>52</code> - Collision mask flag.
 *  @property {number} PROP_DYNAMIC - <code>53</code> - Dynamic flag.
 *  @property {number} PROP_COLLISION_SOUND_URL - <code>54</code> - Collision sound url flag.
 *  @property {number} PROP_ACTION_DATA - <code>55</code> - Action data flag.
 *  @property {number} PROP_CLONEABLE - <code>56</code> - Cloneable flag.
 *  @property {number} PROP_CLONE_LIFETIME - <code>57</code> - Clone lifetime flag.
 *  @property {number} PROP_CLONE_LIMIT - <code>58</code> - Clone limit flag.
 *  @property {number} PROP_CLONE_DYNAMIC - <code>59</code> - Clone dynamic flag.
 *  @property {number} PROP_CLONE_AVATAR_ENTITY - <code>60</code> - Clone avatar entity flag.
 *  @property {number} PROP_CLONE_ORIGIN_ID - <code>61</code> - Clone origin id flag.
 *  @property {number} PROP_SCRIPT - <code>62</code> - Script flag.
 *  @property {number} PROP_SCRIPT_TIMESTAMP - <code>63</code> - Script timestamp flag.
 *  @property {number} PROP_SERVER_SCRIPTS - <code>64</code> - Server scripts flag.
 *  @property {number} PROP_ITEM_NAME - <code>65</code> - Item name flag.
 *  @property {number} PROP_ITEM_DESCRIPTION - <code>66</code> - Item description flag.
 *  @property {number} PROP_ITEM_CATEGORIES - <code>67</code> - Item categories flag.
 *  @property {number} PROP_ITEM_ARTIST - <code>68</code> - Item artist flag.
 *  @property {number} PROP_ITEM_LICENSE - <code>69</code> - Item license flag.
 *  @property {number} PROP_LIMITED_RUN - <code>70</code> - Limited run flag.
 *  @property {number} PROP_MARKETPLACE_ID - <code>71</code> - Marketplace id flag.
 *  @property {number} PROP_EDITION_NUMBER - <code>72</code> - Edition number flag.
 *  @property {number} PROP_ENTITY_INSTANCE_NUMBER - <code>73</code> - Entity instance number flag.
 *  @property {number} PROP_CERTIFICATE_ID - <code>74</code> - Certificate id flag.
 *  @property {number} PROP_CERTIFICATE_TYPE - <code>75</code> - Certificate type flag.
 *  @property {number} PROP_STATIC_CERTIFICATE_VERSION - <code>76</code> - Static certificate version flag.
 *  @property {number} PROP_LOCAL_POSITION - <code>77</code> - Local position flag.
 *  @property {number} PROP_LOCAL_ROTATION - <code>78</code> - Local rotation flag.
 *  @property {number} PROP_LOCAL_VELOCITY - <code>79</code> - Local velocity flag.
 *  @property {number} PROP_LOCAL_ANGULAR_VELOCITY - <code>80</code> - Local angular velocity flag.
 *  @property {number} PROP_LOCAL_DIMENSIONS - <code>81</code> - Local dimensions flag.
 *  @property {number} PROP_SHAPE_TYPE - <code>82</code> - Shape type flag.
 *  @property {number} PROP_COMPOUND_SHAPE_URL - <code>83</code> - Compound shape url flag.
 *  @property {number} PROP_COLOR - <code>84</code> - Color flag.
 *  @property {number} PROP_ALPHA - <code>85</code> - Alpha flag.
 *  @property {number} PROP_PULSE_MIN - <code>86</code> - Pulse min flag.
 *  @property {number} PROP_PULSE_MAX - <code>87</code> - Pulse max flag.
 *  @property {number} PROP_PULSE_PERIOD - <code>88</code> - Pulse period flag.
 *  @property {number} PROP_PULSE_COLOR_MODE - <code>89</code> - Pulse color mode flag.
 *  @property {number} PROP_PULSE_ALPHA_MODE - <code>90</code> - Pulse alpha mode flag.
 *  @property {number} PROP_TEXTURES - <code>91</code> - Textures flag.
 *  @property {number} PROP_DERIVED_0 - <code>92</code> - Derived 0 flag.
 *  @property {number} PROP_DERIVED_1 - <code>93</code> - Derived 1 flag.
 *  @property {number} PROP_DERIVED_2 - <code>94</code> - Derived 2 flag.
 *  @property {number} PROP_DERIVED_3 - <code>95</code> - Derived 3 flag.
 *  @property {number} PROP_DERIVED_4 - <code>96</code> - Derived 4 flag.
 *  @property {number} PROP_DERIVED_5 - <code>97</code> - Derived 5 flag.
 *  @property {number} PROP_DERIVED_6 - <code>98</code> - Derived 6 flag.
 *  @property {number} PROP_DERIVED_7 - <code>99</code> - Derived 7 flag.
 *  @property {number} PROP_DERIVED_8 - <code>100</code> - Derived 8 flag.
 *  @property {number} PROP_DERIVED_9 - <code>101</code> - Derived 9 flag.
 *  @property {number} PROP_DERIVED_10 - <code>102</code> - Derived 10 flag.
 *  @property {number} PROP_DERIVED_11 - <code>103</code> - Derived 11 flag.
 *  @property {number} PROP_DERIVED_12 - <code>104</code> - Derived 12 flag.
 *  @property {number} PROP_DERIVED_13 - <code>105</code> - Derived 13 flag.
 *  @property {number} PROP_DERIVED_14 - <code>106</code> - Derived 14 flag.
 *  @property {number} PROP_DERIVED_15 - <code>107</code> - Derived 15 flag.
 *  @property {number} PROP_DERIVED_16 - <code>108</code> - Derived 16 flag.
 *  @property {number} PROP_DERIVED_17 - <code>109</code> - Derived 17 flag.
 *  @property {number} PROP_DERIVED_18 - <code>110</code> - Derived 18 flag.
 *  @property {number} PROP_DERIVED_19 - <code>111</code> - Derived 19 flag.
 *  @property {number} PROP_DERIVED_20 - <code>112</code> - Derived 20 flag.
 *  @property {number} PROP_DERIVED_21 - <code>113</code> - Derived 21 flag.
 *  @property {number} PROP_DERIVED_22 - <code>114</code> - Derived 22 flag.
 *  @property {number} PROP_DERIVED_23 - <code>115</code> - Derived 23 flag.
 *  @property {number} PROP_DERIVED_24 - <code>116</code> - Derived 24 flag.
 *  @property {number} PROP_DERIVED_25 - <code>117</code> - Derived 25 flag.
 *  @property {number} PROP_DERIVED_26 - <code>118</code> - Derived 26 flag.
 *  @property {number} PROP_DERIVED_27 - <code>119</code> - Derived 27 flag.
 *  @property {number} PROP_DERIVED_28 - <code>120</code> - Derived 28 flag.
 *  @property {number} PROP_DERIVED_29 - <code>121</code> - Derived 29 flag.
 *  @property {number} PROP_DERIVED_30 - <code>122</code> - Derived 30 flag.
 *  @property {number} PROP_DERIVED_31 - <code>123</code> - Derived 31 flag.
 *  @property {number} PROP_DERIVED_32 - <code>124</code> - Derived 32 flag.
 *  @property {number} PROP_DERIVED_33 - <code>125</code> - Derived 33 flag.
 *  @property {number} PROP_DERIVED_34 - <code>126</code> - Derived 34 flag.
 *  @property {number} PROP_AFTER_LAST_ITEM - <code>127</code> - After last item flag.
 *  @property {number} PROP_MAX_PARTICLES - <code>{@link EntityPropertyList|PROP_DERIVED_0}</code> - Max particles flag. First
 *      ParticleEffect entity-specific property.
 *  @property {number} PROP_LIFESPAN - <code>{@link EntityPropertyList|PROP_DERIVED_1}</code> - Lifespan flag.
 *  @property {number} PROP_EMITTING_PARTICLES - <code>{@link EntityPropertyList|PROP_DERIVED_2}</code> - Emitting_particles
 *      flag.
 *  @property {number} PROP_EMIT_RATE - <code>{@link EntityPropertyList|PROP_DERIVED_3}</code> - Emit rate flag.
 *  @property {number} PROP_EMIT_SPEED - <code>{@link EntityPropertyList|PROP_DERIVED_4}</code> - Emit speed flag.
 *  @property {number} PROP_SPEED_SPREAD - <code>{@link EntityPropertyList|PROP_DERIVED_5}</code> - Speed spread flag.
 *  @property {number} PROP_EMIT_ORIENTATION - <code>{@link EntityPropertyList|PROP_DERIVED_6}</code> - Emit orientation flag.
 *  @property {number} PROP_EMIT_DIMENSIONS - <code>{@link EntityPropertyList|PROP_DERIVED_7}</code> - Emit dimensions flag.
 *  @property {number} PROP_ACCELERATION_SPREAD - <code>{@link EntityPropertyList|PROP_DERIVED_8}</code> - Acceleration spread
 *      flag.
 *  @property {number} PROP_POLAR_START - <code>{@link EntityPropertyList|PROP_DERIVED_9}</code> - Polar start flag.
 *  @property {number} PROP_POLAR_FINISH - <code>{@link EntityPropertyList|PROP_DERIVED_10}</code> - Polar finish flag.
 *  @property {number} PROP_AZIMUTH_START - <code>{@link EntityPropertyList|PROP_DERIVED_11}</code> - Azimuth start flag.
 *  @property {number} PROP_AZIMUTH_FINISH - <code>{@link EntityPropertyList|PROP_DERIVED_12}</code> - Azimuth finish flag.
 *  @property {number} PROP_EMIT_RADIUS_START - <code>{@link EntityPropertyList|PROP_DERIVED_13}</code> - Emit radius start
 *      flag.
 *  @property {number} PROP_EMIT_ACCELERATION - <code>{@link EntityPropertyList|PROP_DERIVED_14}</code> - Emit acceleration
 *      flag.
 *  @property {number} PROP_PARTICLE_RADIUS - <code>{@link EntityPropertyList|PROP_DERIVED_15}</code> - Particle radius flag.
 *  @property {number} PROP_RADIUS_SPREAD - <code>{@link EntityPropertyList|PROP_DERIVED_16}</code> - Radius spread flag.
 *  @property {number} PROP_RADIUS_START - <code>{@link EntityPropertyList|PROP_DERIVED_17}</code> - Radius start flag.
 *  @property {number} PROP_RADIUS_FINISH - <code>{@link EntityPropertyList|PROP_DERIVED_18}</code> - Radius finish flag.
 *  @property {number} PROP_COLOR_SPREAD - <code>{@link EntityPropertyList|PROP_DERIVED_19}</code> - Color spread flag.
 *  @property {number} PROP_COLOR_START - <code>{@link EntityPropertyList|PROP_DERIVED_20}</code> - Color start flag.
 *  @property {number} PROP_COLOR_FINISH - <code>{@link EntityPropertyList|PROP_DERIVED_21}</code> - Color finish flag.
 *  @property {number} PROP_ALPHA_SPREAD - <code>{@link EntityPropertyList|PROP_DERIVED_22}</code> - Alpha spread flag.
 *  @property {number} PROP_ALPHA_START - <code>{@link EntityPropertyList|PROP_DERIVED_23}</code> - Alpha start flag.
 *  @property {number} PROP_ALPHA_FINISH - <code>{@link EntityPropertyList|PROP_DERIVED_24}</code> - Alpha finish flag.
 *  @property {number} PROP_EMITTER_SHOULD_TRAIL - <code>{@link EntityPropertyList|PROP_DERIVED_25}</code> - Emitter should
 *      trail flag.
 *  @property {number} PROP_PARTICLE_SPIN - <code>{@link EntityPropertyList|PROP_DERIVED_26}</code> - Particle spin flag.
 *  @property {number} PROP_SPIN_START - <code>{@link EntityPropertyList|PROP_DERIVED_27}</code> - Spin start flag.
 *  @property {number} PROP_SPIN_FINISH - <code>{@link EntityPropertyList|PROP_DERIVED_28}</code> - Spin finish flag.
 *  @property {number} PROP_SPIN_SPREAD - <code>{@link EntityPropertyList|PROP_DERIVED_29}</code> - Spin spread flag.
 *  @property {number} PROP_PARTICLE_ROTATE_WITH_ENTITY - <code>{@link EntityPropertyList|PROP_DERIVED_30}</code> - Particle
 *      rotate with entity flag.
 *  @property {number} PROP_MODEL_URL - <code>{@link EntityPropertyList|PROP_DERIVED_0}</code> - Model url flag. First
 *      {@link ModelEntityItem|ModelEntity}-specific property.
 *  @property {number} PROP_MODEL_SCALE - <code>{@link EntityPropertyList|PROP_DERIVED_1}</code> - Model scale flag.
 *  @property {number} PROP_JOINT_ROTATIONS_SET - <code>{@link EntityPropertyList|PROP_DERIVED_2}</code> - Joint rotations set
 *      flag.
 *  @property {number} PROP_JOINT_ROTATIONS - <code>{@link EntityPropertyList|PROP_DERIVED_3}</code> - Joint rotations flag.
 *  @property {number} PROP_JOINT_TRANSLATIONS_SET - <code>{@link EntityPropertyList|PROP_DERIVED_4}</code> - Joint translations
 *      set flag.
 *  @property {number} PROP_JOINT_TRANSLATIONS - <code>{@link EntityPropertyList|PROP_DERIVED_5}</code> - Joint translations
 *      flag.
 *  @property {number} PROP_RELAY_PARENT_JOINTS - <code>{@link EntityPropertyList|PROP_DERIVED_6}</code> - Relay parent joints
 *      flag.
 *  @property {number} PROP_GROUP_CULLED - <code>{@link EntityPropertyList|PROP_DERIVED_7}</code> - Group culled flag.
 *  @property {number} PROP_BLENDSHAPE_COEFFICIENTS - <code>{@link EntityPropertyList|PROP_DERIVED_8}</code> - Blendshape
 *      coefficients flag.
 *  @property {number} PROP_USE_ORIGINAL_PIVOT - <code>{@link EntityPropertyList|PROP_DERIVED_9}</code> - Use original pivot
 *      flag.
 *  @property {number} PROP_ANIMATION_URL - <code>{@link EntityPropertyList|PROP_DERIVED_10}</code> - Animation url flag.
 *  @property {number} PROP_ANIMATION_ALLOW_TRANSLATION - <code>{@link EntityPropertyList|PROP_DERIVED_11}</code> - Animation
 *      allow translation flag.
 *  @property {number} PROP_ANIMATION_FPS - <code>{@link EntityPropertyList|PROP_DERIVED_12}</code> - Animation fps flag.
 *  @property {number} PROP_ANIMATION_FRAME_INDEX - <code>{@link EntityPropertyList|PROP_DERIVED_13}</code> - Animation frame
 *      index flag.
 *  @property {number} PROP_ANIMATION_PLAYING - <code>{@link EntityPropertyList|PROP_DERIVED_14}</code> - Animation playing
 *      flag.
 *  @property {number} PROP_ANIMATION_LOOP - <code>{@link EntityPropertyList|PROP_DERIVED_15}</code> - Animation loop flag.
 *  @property {number} PROP_ANIMATION_FIRST_FRAME - <code>{@link EntityPropertyList|PROP_DERIVED_16}</code> - Animation first
 *      frame flag.
 *  @property {number} PROP_ANIMATION_LAST_FRAME - <code>{@link EntityPropertyList|PROP_DERIVED_17}</code> - Animation last
 *      frame flag.
 *  @property {number} PROP_ANIMATION_HOLD - <code>{@link EntityPropertyList|PROP_DERIVED_18}</code> - Animation hold flag.
 *  @property {number} PROP_SHAPE - <code>{@link EntityPropertyList|PROP_DERIVED_0}</code> - Shape flag.
 */
enum EntityPropertyList {
    // C++  EntityPropertyList
    //      EntityPropertyList PROP_LAST_ITEM = (EntityPropertyList)(PROP_AFTER_LAST_ITEM - 1);

    PROP_PAGED_PROPERTY,
    PROP_CUSTOM_PROPERTIES_INCLUDED,

    // Core properties
    PROP_SIMULATION_OWNER,
    PROP_PARENT_ID,
    PROP_PARENT_JOINT_INDEX,
    PROP_VISIBLE,
    PROP_NAME,
    PROP_LOCKED,
    PROP_USER_DATA,
    PROP_PRIVATE_USER_DATA,
    PROP_HREF,
    PROP_DESCRIPTION,
    PROP_POSITION,
    PROP_DIMENSIONS,
    PROP_ROTATION,
    PROP_REGISTRATION_POINT,
    PROP_CREATED,
    PROP_LAST_EDITED_BY,
    PROP_ENTITY_HOST_TYPE,
    PROP_OWNING_AVATAR_ID,
    PROP_QUERY_AA_CUBE,
    PROP_CAN_CAST_SHADOW,
    PROP_VISIBLE_IN_SECONDARY_CAMERA,
    PROP_RENDER_LAYER,
    PROP_PRIMITIVE_MODE,
    PROP_IGNORE_PICK_INTERSECTION,
    PROP_RENDER_WITH_ZONES,
    PROP_BILLBOARD_MODE,

    // Grab
    PROP_GRAB_GRABBABLE,
    PROP_GRAB_KINEMATIC,
    PROP_GRAB_FOLLOWS_CONTROLLER,
    PROP_GRAB_TRIGGERABLE,
    PROP_GRAB_EQUIPPABLE,
    PROP_GRAB_DELEGATE_TO_PARENT,
    PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET,
    PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET,
    PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET,
    PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET,
    PROP_GRAB_EQUIPPABLE_INDICATOR_URL,
    PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE,
    PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET,

    // Physics
    PROP_DENSITY,
    PROP_VELOCITY,
    PROP_ANGULAR_VELOCITY,
    PROP_GRAVITY,
    PROP_ACCELERATION,
    PROP_DAMPING,
    PROP_ANGULAR_DAMPING,
    PROP_RESTITUTION,
    PROP_FRICTION,
    PROP_LIFETIME,
    PROP_COLLISIONLESS,
    PROP_COLLISION_MASK,
    PROP_DYNAMIC,
    PROP_COLLISION_SOUND_URL,
    PROP_ACTION_DATA,

    // Cloning
    PROP_CLONEABLE,
    PROP_CLONE_LIFETIME,
    PROP_CLONE_LIMIT,
    PROP_CLONE_DYNAMIC,
    PROP_CLONE_AVATAR_ENTITY,
    PROP_CLONE_ORIGIN_ID,

    // Scripts
    PROP_SCRIPT,
    PROP_SCRIPT_TIMESTAMP,
    PROP_SERVER_SCRIPTS,

    // Certifiable Properties
    PROP_ITEM_NAME,
    PROP_ITEM_DESCRIPTION,
    PROP_ITEM_CATEGORIES,
    PROP_ITEM_ARTIST,
    PROP_ITEM_LICENSE,
    PROP_LIMITED_RUN,
    PROP_MARKETPLACE_ID,
    PROP_EDITION_NUMBER,
    PROP_ENTITY_INSTANCE_NUMBER,
    PROP_CERTIFICATE_ID,
    PROP_CERTIFICATE_TYPE,
    PROP_STATIC_CERTIFICATE_VERSION,

    // Used to convert values to and from scripts
    PROP_LOCAL_POSITION,
    PROP_LOCAL_ROTATION,
    PROP_LOCAL_VELOCITY,
    PROP_LOCAL_ANGULAR_VELOCITY,
    PROP_LOCAL_DIMENSIONS,

    // These properties are used by multiple subtypes but aren't in the base EntityItem.
    PROP_SHAPE_TYPE,
    PROP_COMPOUND_SHAPE_URL,
    PROP_COLOR,
    PROP_ALPHA,
    PROP_PULSE_MIN,
    PROP_PULSE_MAX,
    PROP_PULSE_PERIOD,
    PROP_PULSE_COLOR_MODE,
    PROP_PULSE_ALPHA_MODE,
    PROP_TEXTURES,
    // Add new shared EntityItem properties to the list above this line.

    // We need as many of these as the number of unique properties of a derived EntityItem class.
    PROP_DERIVED_0,
    PROP_DERIVED_1,
    PROP_DERIVED_2,
    PROP_DERIVED_3,
    PROP_DERIVED_4,
    PROP_DERIVED_5,
    PROP_DERIVED_6,
    PROP_DERIVED_7,
    PROP_DERIVED_8,
    PROP_DERIVED_9,
    PROP_DERIVED_10,
    PROP_DERIVED_11,
    PROP_DERIVED_12,
    PROP_DERIVED_13,
    PROP_DERIVED_14,
    PROP_DERIVED_15,
    PROP_DERIVED_16,
    PROP_DERIVED_17,
    PROP_DERIVED_18,
    PROP_DERIVED_19,
    PROP_DERIVED_20,
    PROP_DERIVED_21,
    PROP_DERIVED_22,
    PROP_DERIVED_23,
    PROP_DERIVED_24,
    PROP_DERIVED_25,
    PROP_DERIVED_26,
    PROP_DERIVED_27,
    PROP_DERIVED_28,
    PROP_DERIVED_29,
    PROP_DERIVED_30,
    PROP_DERIVED_31,
    PROP_DERIVED_32,
    PROP_DERIVED_33,
    PROP_DERIVED_34,
    PROP_AFTER_LAST_ITEM,

    // WARNING! Do not add props here unless you intentionally mean to reuse PROP_DERIVED_X indexes.
    // These properties intentionally reuse the enum values for other properties which will never overlap with each other.
    // We do this so that we don't have to expand the size of the properties bitflags mask.
    // Only add properties here that are only used by one subclass.  Otherwise, they should go above to prevent collisions

    // Particles
    PROP_MAX_PARTICLES = PROP_DERIVED_0,
    PROP_LIFESPAN = PROP_DERIVED_1,
    PROP_EMITTING_PARTICLES = PROP_DERIVED_2,
    PROP_EMIT_RATE = PROP_DERIVED_3,
    PROP_EMIT_SPEED = PROP_DERIVED_4,
    PROP_SPEED_SPREAD = PROP_DERIVED_5,
    PROP_EMIT_ORIENTATION = PROP_DERIVED_6,
    PROP_EMIT_DIMENSIONS = PROP_DERIVED_7,
    PROP_ACCELERATION_SPREAD = PROP_DERIVED_8,
    PROP_POLAR_START = PROP_DERIVED_9,
    PROP_POLAR_FINISH = PROP_DERIVED_10,
    PROP_AZIMUTH_START = PROP_DERIVED_11,
    PROP_AZIMUTH_FINISH = PROP_DERIVED_12,
    PROP_EMIT_RADIUS_START = PROP_DERIVED_13,
    PROP_EMIT_ACCELERATION = PROP_DERIVED_14,
    PROP_PARTICLE_RADIUS = PROP_DERIVED_15,
    PROP_RADIUS_SPREAD = PROP_DERIVED_16,
    PROP_RADIUS_START = PROP_DERIVED_17,
    PROP_RADIUS_FINISH = PROP_DERIVED_18,
    PROP_COLOR_SPREAD = PROP_DERIVED_19,
    PROP_COLOR_START = PROP_DERIVED_20,
    PROP_COLOR_FINISH = PROP_DERIVED_21,
    PROP_ALPHA_SPREAD = PROP_DERIVED_22,
    PROP_ALPHA_START = PROP_DERIVED_23,
    PROP_ALPHA_FINISH = PROP_DERIVED_24,
    PROP_EMITTER_SHOULD_TRAIL = PROP_DERIVED_25,
    PROP_PARTICLE_SPIN = PROP_DERIVED_26,
    PROP_SPIN_START = PROP_DERIVED_27,
    PROP_SPIN_FINISH = PROP_DERIVED_28,
    PROP_SPIN_SPREAD = PROP_DERIVED_29,
    PROP_PARTICLE_ROTATE_WITH_ENTITY = PROP_DERIVED_30,

    // Model
    PROP_MODEL_URL = PROP_DERIVED_0,
    PROP_MODEL_SCALE = PROP_DERIVED_1,
    PROP_JOINT_ROTATIONS_SET = PROP_DERIVED_2,
    PROP_JOINT_ROTATIONS = PROP_DERIVED_3,
    PROP_JOINT_TRANSLATIONS_SET = PROP_DERIVED_4,
    PROP_JOINT_TRANSLATIONS = PROP_DERIVED_5,
    PROP_RELAY_PARENT_JOINTS = PROP_DERIVED_6,
    PROP_GROUP_CULLED = PROP_DERIVED_7,
    PROP_BLENDSHAPE_COEFFICIENTS = PROP_DERIVED_8,
    PROP_USE_ORIGINAL_PIVOT = PROP_DERIVED_9,

    // Animation
    PROP_ANIMATION_URL = PROP_DERIVED_10,
    PROP_ANIMATION_ALLOW_TRANSLATION = PROP_DERIVED_11,
    PROP_ANIMATION_FPS = PROP_DERIVED_12,
    PROP_ANIMATION_FRAME_INDEX = PROP_DERIVED_13,
    PROP_ANIMATION_PLAYING = PROP_DERIVED_14,
    PROP_ANIMATION_LOOP = PROP_DERIVED_15,
    PROP_ANIMATION_FIRST_FRAME = PROP_DERIVED_16,
    PROP_ANIMATION_LAST_FRAME = PROP_DERIVED_17,
    PROP_ANIMATION_HOLD = PROP_DERIVED_18,

    // Light
    PROP_IS_SPOTLIGHT = PROP_DERIVED_0,
    PROP_INTENSITY = PROP_DERIVED_1,
    PROP_EXPONENT = PROP_DERIVED_2,
    PROP_CUTOFF = PROP_DERIVED_3,
    PROP_FALLOFF_RADIUS = PROP_DERIVED_4,

    // Text
    PROP_TEXT = PROP_DERIVED_0,
    PROP_LINE_HEIGHT = PROP_DERIVED_1,
    PROP_TEXT_COLOR = PROP_DERIVED_2,
    PROP_TEXT_ALPHA = PROP_DERIVED_3,
    PROP_BACKGROUND_COLOR = PROP_DERIVED_4,
    PROP_BACKGROUND_ALPHA = PROP_DERIVED_5,
    PROP_LEFT_MARGIN = PROP_DERIVED_6,
    PROP_RIGHT_MARGIN = PROP_DERIVED_7,
    PROP_TOP_MARGIN = PROP_DERIVED_8,
    PROP_BOTTOM_MARGIN = PROP_DERIVED_9,
    PROP_UNLIT = PROP_DERIVED_10,
    PROP_FONT = PROP_DERIVED_11,
    PROP_TEXT_EFFECT = PROP_DERIVED_12,
    PROP_TEXT_EFFECT_COLOR = PROP_DERIVED_13,
    PROP_TEXT_EFFECT_THICKNESS = PROP_DERIVED_14,
    PROP_TEXT_ALIGNMENT = PROP_DERIVED_15,

    // Zone
    // Keylight
    PROP_KEYLIGHT_COLOR = PROP_DERIVED_0,
    PROP_KEYLIGHT_INTENSITY = PROP_DERIVED_1,
    PROP_KEYLIGHT_DIRECTION = PROP_DERIVED_2,
    PROP_KEYLIGHT_CAST_SHADOW = PROP_DERIVED_3,
    PROP_KEYLIGHT_SHADOW_BIAS = PROP_DERIVED_4,
    PROP_KEYLIGHT_SHADOW_MAX_DISTANCE = PROP_DERIVED_5,
    // Ambient light
    PROP_AMBIENT_LIGHT_INTENSITY = PROP_DERIVED_6,
    PROP_AMBIENT_LIGHT_URL = PROP_DERIVED_7,
    // Skybox
    PROP_SKYBOX_COLOR = PROP_DERIVED_8,
    PROP_SKYBOX_URL = PROP_DERIVED_9,
    // Haze
    PROP_HAZE_RANGE = PROP_DERIVED_10,
    PROP_HAZE_COLOR = PROP_DERIVED_11,
    PROP_HAZE_GLARE_COLOR = PROP_DERIVED_12,
    PROP_HAZE_ENABLE_GLARE = PROP_DERIVED_13,
    PROP_HAZE_GLARE_ANGLE = PROP_DERIVED_14,
    PROP_HAZE_ALTITUDE_EFFECT = PROP_DERIVED_15,
    PROP_HAZE_CEILING = PROP_DERIVED_16,
    PROP_HAZE_BASE_REF = PROP_DERIVED_17,
    PROP_HAZE_BACKGROUND_BLEND = PROP_DERIVED_18,
    PROP_HAZE_ATTENUATE_KEYLIGHT = PROP_DERIVED_19,
    PROP_HAZE_KEYLIGHT_RANGE = PROP_DERIVED_20,
    PROP_HAZE_KEYLIGHT_ALTITUDE = PROP_DERIVED_21,
    // Bloom
    PROP_BLOOM_INTENSITY = PROP_DERIVED_22,
    PROP_BLOOM_THRESHOLD = PROP_DERIVED_23,
    PROP_BLOOM_SIZE = PROP_DERIVED_24,
    PROP_FLYING_ALLOWED = PROP_DERIVED_25,
    PROP_GHOSTING_ALLOWED = PROP_DERIVED_26,
    PROP_FILTER_URL = PROP_DERIVED_27,
    PROP_KEY_LIGHT_MODE = PROP_DERIVED_28,
    PROP_AMBIENT_LIGHT_MODE = PROP_DERIVED_29,
    PROP_SKYBOX_MODE = PROP_DERIVED_30,
    PROP_HAZE_MODE = PROP_DERIVED_31,
    PROP_BLOOM_MODE = PROP_DERIVED_32,
    // Avatar priority
    PROP_AVATAR_PRIORITY = PROP_DERIVED_33,
    // Screen-sharing
    PROP_SCREENSHARE = PROP_DERIVED_34,

    // Polyvox
    PROP_VOXEL_VOLUME_SIZE = PROP_DERIVED_0,
    PROP_VOXEL_DATA = PROP_DERIVED_1,
    PROP_VOXEL_SURFACE_STYLE = PROP_DERIVED_2,
    PROP_X_TEXTURE_URL = PROP_DERIVED_3,
    PROP_Y_TEXTURE_URL = PROP_DERIVED_4,
    PROP_Z_TEXTURE_URL = PROP_DERIVED_5,
    PROP_X_N_NEIGHBOR_ID = PROP_DERIVED_6,
    PROP_Y_N_NEIGHBOR_ID = PROP_DERIVED_7,
    PROP_Z_N_NEIGHBOR_ID = PROP_DERIVED_8,
    PROP_X_P_NEIGHBOR_ID = PROP_DERIVED_9,
    PROP_Y_P_NEIGHBOR_ID = PROP_DERIVED_10,
    PROP_Z_P_NEIGHBOR_ID = PROP_DERIVED_11,

    // Web
    PROP_SOURCE_URL = PROP_DERIVED_0,
    PROP_DPI = PROP_DERIVED_1,
    PROP_SCRIPT_URL = PROP_DERIVED_2,
    PROP_MAX_FPS = PROP_DERIVED_3,
    PROP_INPUT_MODE = PROP_DERIVED_4,
    PROP_SHOW_KEYBOARD_FOCUS_HIGHLIGHT = PROP_DERIVED_5,
    PROP_WEB_USE_BACKGROUND = PROP_DERIVED_6,
    PROP_USER_AGENT = PROP_DERIVED_7,

    // Polyline
    PROP_LINE_POINTS = PROP_DERIVED_0,
    PROP_STROKE_WIDTHS = PROP_DERIVED_1,
    PROP_STROKE_NORMALS = PROP_DERIVED_2,
    PROP_STROKE_COLORS = PROP_DERIVED_3,
    PROP_IS_UV_MODE_STRETCH = PROP_DERIVED_4,
    PROP_LINE_GLOW = PROP_DERIVED_5,
    PROP_LINE_FACE_CAMERA = PROP_DERIVED_6,

    // Shape
    PROP_SHAPE = PROP_DERIVED_0,

    // Material
    PROP_MATERIAL_URL = PROP_DERIVED_0,
    PROP_MATERIAL_MAPPING_MODE = PROP_DERIVED_1,
    PROP_MATERIAL_PRIORITY = PROP_DERIVED_2,
    PROP_PARENT_MATERIAL_NAME = PROP_DERIVED_3,
    PROP_MATERIAL_MAPPING_POS = PROP_DERIVED_4,
    PROP_MATERIAL_MAPPING_SCALE = PROP_DERIVED_5,
    PROP_MATERIAL_MAPPING_ROT = PROP_DERIVED_6,
    PROP_MATERIAL_DATA = PROP_DERIVED_7,
    PROP_MATERIAL_REPEAT = PROP_DERIVED_8,

    // Image
    PROP_IMAGE_URL = PROP_DERIVED_0,
    PROP_EMISSIVE = PROP_DERIVED_1,
    PROP_KEEP_ASPECT_RATIO = PROP_DERIVED_2,
    PROP_SUB_IMAGE = PROP_DERIVED_3,

    // Grid
    PROP_GRID_FOLLOW_CAMERA = PROP_DERIVED_0,
    PROP_MAJOR_GRID_EVERY = PROP_DERIVED_1,
    PROP_MINOR_GRID_EVERY = PROP_DERIVED_2,

    // Gizmo
    PROP_GIZMO_TYPE = PROP_DERIVED_0,
    // Ring
    PROP_START_ANGLE = PROP_DERIVED_1,
    PROP_END_ANGLE = PROP_DERIVED_2,
    PROP_INNER_RADIUS = PROP_DERIVED_3,
    PROP_INNER_START_COLOR = PROP_DERIVED_4,
    PROP_INNER_END_COLOR = PROP_DERIVED_5,
    PROP_OUTER_START_COLOR = PROP_DERIVED_6,
    PROP_OUTER_END_COLOR = PROP_DERIVED_7,
    PROP_INNER_START_ALPHA = PROP_DERIVED_8,
    PROP_INNER_END_ALPHA = PROP_DERIVED_9,
    PROP_OUTER_START_ALPHA = PROP_DERIVED_10,
    PROP_OUTER_END_ALPHA = PROP_DERIVED_11,
    PROP_HAS_TICK_MARKS = PROP_DERIVED_12,
    PROP_MAJOR_TICK_MARKS_ANGLE = PROP_DERIVED_13,
    PROP_MINOR_TICK_MARKS_ANGLE = PROP_DERIVED_14,
    PROP_MAJOR_TICK_MARKS_LENGTH = PROP_DERIVED_15,
    PROP_MINOR_TICK_MARKS_LENGTH = PROP_DERIVED_16,
    PROP_MAJOR_TICK_MARKS_COLOR = PROP_DERIVED_17,
    PROP_MINOR_TICK_MARKS_COLOR = PROP_DERIVED_18,

    // Last item
    PROP_LAST_ITEM = PROP_AFTER_LAST_ITEM - 1
}

/*@devdoc
 *  The <code>EntityPropertyFlags</code> provides facilities to decode, set and get entity property flags per the
 *  {@link EntityPropertyList} values.
 *
 *  <p>C++ <code>typedef PropertyFlags<EntityPropertyList> EntityPropertyFlags</code></p>
 *  @class EntityPropertyFlags
 *  @extends PropertyFlags
 */
class EntityPropertyFlags extends PropertyFlags {
    // C++  typedef PropertyFlags<EntityPropertyList> EntityPropertyFlags
}

export { EntityPropertyList, EntityPropertyFlags };
