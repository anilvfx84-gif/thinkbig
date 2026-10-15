import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/profiles";
import ProfilesLib "../lib/profiles";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Principal, Types.UserProfile>,
) {
  public query ({ caller }) func getCallerProfile() : async ?Types.UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ProfilesLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func saveCallerProfile(displayName : Text, bio : Text, contactEmail : Text, roles : [Types.AccountRole]) : async Types.UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ProfilesLib.saveProfile(profiles, caller, displayName, bio, contactEmail, roles);
  };

  public shared ({ caller }) func addCallerRole(role : Types.AccountRole) : async Types.UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ProfilesLib.addRole(profiles, caller, role);
  };

  public query func getProfile(user : Principal) : async ?Types.UserProfile {
    ProfilesLib.getProfile(profiles, user);
  };
};
