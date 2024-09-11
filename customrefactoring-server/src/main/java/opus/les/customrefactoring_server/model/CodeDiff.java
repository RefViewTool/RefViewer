package opus.les.customrefactoring_server.model;


public class CodeDiff {
    private String before;
    private String after;

    public CodeDiff() {
    }

    public CodeDiff(String before, String after) {
        this.before = before;
        this.after = after;
    }

    public String getBefore() {
        return before;
    }

    public void setBefore(String before) {
        this.before = before;
    }

    public String getAfter() {
        return after;
    }

    public void setAfter(String after) {
        this.after = after;
    }
}
