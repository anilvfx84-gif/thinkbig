import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/ideas";
import IdeasLib "../lib/ideas";

mixin (
  accessControlState : AccessControl.AccessControlState,
  ideas : Map.Map<Nat, Types.Idea>,
  nextIdeaId : { var value : Nat },
) {
  public shared ({ caller }) func createIdea(input : Types.IdeaInput, status : Types.IdeaStatus) : async Types.Idea {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    IdeasLib.createIdea(ideas, nextIdeaId, caller, input, status);
  };

  public shared ({ caller }) func updateIdea(id : Nat, input : Types.IdeaInput) : async ?Types.Idea {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    IdeasLib.updateIdea(ideas, caller, id, input);
  };

  public shared ({ caller }) func publishIdea(id : Nat) : async ?Types.Idea {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    IdeasLib.setStatus(ideas, caller, id, #published);
  };

  public shared ({ caller }) func unpublishIdea(id : Nat) : async ?Types.Idea {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    IdeasLib.setStatus(ideas, caller, id, #draft);
  };

  public shared ({ caller }) func deleteIdea(id : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    IdeasLib.deleteIdea(ideas, caller, id);
  };

  public shared ({ caller }) func recordIdeaView(id : Nat) : async ?Types.Idea {
    ignore caller;
    IdeasLib.recordView(ideas, id);
  };

  public query func getIdea(id : Nat) : async ?Types.Idea {
    IdeasLib.getIdea(ideas, id);
  };

  public query ({ caller }) func listMyIdeas() : async [Types.Idea] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    IdeasLib.listIdeasByOwner(ideas, caller);
  };

  public query func listPublishedIdeas(filter : Types.IdeaFilter) : async [Types.Idea] {
    IdeasLib.listPublishedIdeas(ideas, filter);
  };
};
