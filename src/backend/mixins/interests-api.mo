import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/interests";
import IdeaTypes "../types/ideas";
import InterestsLib "../lib/interests";
import IdeasLib "../lib/ideas";

mixin (
  accessControlState : AccessControl.AccessControlState,
  interests : Map.Map<Nat, Types.Interest>,
  nextInterestId : { var value : Nat },
  ideas : Map.Map<Nat, IdeaTypes.Idea>,
) {
  public shared ({ caller }) func expressInterest(ideaId : Nat, message : Text) : async Types.Interest {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let idea = switch (IdeasLib.getIdea(ideas, ideaId)) {
      case (?i) { i };
      case null { Runtime.trap("Idea not found") };
    };
    if (idea.status != #published) {
      Runtime.trap("Idea is not published");
    };
    if (InterestsLib.hasInterest(interests, ideaId, caller)) {
      Runtime.trap("You have already expressed interest in this idea");
    };
    let interest = InterestsLib.expressInterest(interests, nextInterestId, ideaId, caller, message);
    ignore IdeasLib.incrementInterestCount(ideas, ideaId);
    interest;
  };

  public query ({ caller }) func listInterestsForIdea(ideaId : Nat) : async [Types.Interest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let idea = switch (IdeasLib.getIdea(ideas, ideaId)) {
      case (?i) { i };
      case null { Runtime.trap("Idea not found") };
    };
    if (idea.owner != caller) {
      Runtime.trap("Unauthorized: Only the idea owner can view its interests");
    };
    InterestsLib.listInterestsForIdea(interests, ideaId);
  };

  public query ({ caller }) func listMyInterests() : async [Types.Interest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    InterestsLib.listInterestsByBuyer(interests, caller);
  };
};
