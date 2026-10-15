import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/profiles";

module {
  public func getProfile(profiles : Map.Map<Principal, Types.UserProfile>, user : Principal) : ?Types.UserProfile {
    profiles.get(user);
  };

  public func saveProfile(profiles : Map.Map<Principal, Types.UserProfile>, user : Principal, displayName : Text, bio : Text, contactEmail : Text, roles : [Types.AccountRole]) : Types.UserProfile {
    let now = Time.now();
    let profile : Types.UserProfile = switch (profiles.get(user)) {
      case (?existing) {
        {
          id = user;
          displayName;
          bio;
          contactEmail;
          roles;
          createdAt = existing.createdAt;
          updatedAt = now;
        };
      };
      case null {
        {
          id = user;
          displayName;
          bio;
          contactEmail;
          roles;
          createdAt = now;
          updatedAt = now;
        };
      };
    };
    profiles.add(user, profile);
    profile;
  };

  public func addRole(profiles : Map.Map<Principal, Types.UserProfile>, user : Principal, role : Types.AccountRole) : Types.UserProfile {
    let now = Time.now();
    let existing = profiles.get(user);
    let currentRoles = switch (existing) {
      case (?p) { p.roles };
      case null { [] };
    };
    let alreadyHas = currentRoles.any(func r = r == role);
    let roles = if (alreadyHas) { currentRoles } else { currentRoles.concat([role]) };
    let profile : Types.UserProfile = switch (existing) {
      case (?p) {
        {
          id = p.id;
          displayName = p.displayName;
          bio = p.bio;
          contactEmail = p.contactEmail;
          roles;
          createdAt = p.createdAt;
          updatedAt = now;
        };
      };
      case null {
        {
          id = user;
          displayName = "";
          bio = "";
          contactEmail = "";
          roles;
          createdAt = now;
          updatedAt = now;
        };
      };
    };
    profiles.add(user, profile);
    profile;
  };
};
